const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { pgQuery } = require('../db');
const { getNeo4jDriver } = require('../db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, city, specialization, fee, qualification, experience } = req.body;

    const existingUser = await pgQuery('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pgQuery(
      `INSERT INTO users (name, email, password, role, phone, city) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email, role, phone, city`,
      [name, email, hashedPassword, role || 'patient', phone || null, city || null]
    );

    const user = result.rows[0];
    if (role === 'doctor') {
      await pgQuery(
        `INSERT INTO doctors (user_id, specialization, qualification, experience, fee, city) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, specialization, qualification || 'MBBS', experience || 0, fee, city]
      );

      const driver = getNeo4jDriver();
      if (driver) {
        const session = driver.session();
        await session.run(
          `CREATE (d:Doctor {id: $id, name: $name, specialization: $specialization, city: $city})`,
          { id: user.id, name, specialization, city }
        );
        await session.close();
      }
    }

    if (role === 'patient') {
      await pgQuery(`INSERT INTO patients (user_id) VALUES ($1)`, [user.id]);

      const driver = getNeo4jDriver();
      if (driver) {
        const session = driver.session();
        await session.run(
          `CREATE (p:Patient {id: $id, name: $name, city: $city})`,
          { id: user.id, name, city }
        );
        await session.close();
      }
    }

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);

    const result = await pgQuery(
      'SELECT id, name, email, password, role, phone, city, avatar FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    delete user.password;
    const token = generateToken(user.id);

    console.log('Login successful, token generated');
    console.log('User role being sent:', user.role);

    res.json({ success: true, token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pgQuery(
      'SELECT id, name, email, role, phone, city, avatar, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get complete patient profile with all details
const getCompleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await pgQuery(
      `SELECT id, name, email, role, phone, city, avatar, 
              TO_CHAR(created_at, 'Month YYYY') as member_since
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userResult.rows[0];

    const patientResult = await pgQuery(
      `SELECT blood_group, allergies, 
              TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth,
              emergency_contact_name, emergency_contact_phone
       FROM patients WHERE user_id = $1`,
      [userId]
    );

    const patient = patientResult.rows[0] || {};

    const completeProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      avatar: user.avatar,
      memberSince: user.member_since?.trim() || 'January 2024',
      bloodGroup: patient.blood_group || '',
      allergies: patient.allergies || '',
      dateOfBirth: patient.date_of_birth || '',
      emergencyContact: patient.emergency_contact_name || '',
      emergencyPhone: patient.emergency_contact_phone || ''
    };

    res.json({ success: true, user: completeProfile });

  } catch (error) {
    console.error('Get complete profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload profile picture
const uploadAvatar = async (req, res) => {
  try {
    console.log('=== UPLOAD AVATAR CALLED ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const userCheck = await pgQuery(`SELECT id, avatar FROM users WHERE id = $1`, [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldAvatar = userCheck.rows[0]?.avatar;
    if (oldAvatar) {
      const oldPath = path.join(__dirname, '../../', oldAvatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log('Deleted old avatar:', oldPath);
      }
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pgQuery(`UPDATE users SET avatar = $1 WHERE id = $2`, [avatarUrl, userId]);

    const updatedUser = await pgQuery(
      'SELECT id, name, email, role, phone, city, avatar FROM users WHERE id = $1',
      [userId]
    );

    console.log('Avatar uploaded successfully:', avatarUrl);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      avatarUrl: avatarUrl,
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, city, bloodGroup, allergies, dateOfBirth, emergencyContact, emergencyPhone } = req.body;

    console.log('Update profile for userId:', userId);

    await pgQuery(
      `UPDATE users SET name = $1, phone = $2, city = $3 WHERE id = $4`,
      [name, phone || null, city || null, userId]
    );

    const patientExists = await pgQuery(`SELECT id FROM patients WHERE user_id = $1`, [userId]);

    if (patientExists.rows.length > 0) {
      await pgQuery(
        `UPDATE patients SET 
          blood_group = $1,
          allergies = $2,
          date_of_birth = $3,
          emergency_contact_name = $4,
          emergency_contact_phone = $5
         WHERE user_id = $6`,
        [bloodGroup || null, allergies || null, dateOfBirth || null, emergencyContact || null, emergencyPhone || null, userId]
      );
    } else {
      await pgQuery(
        `INSERT INTO patients (user_id, blood_group, allergies, date_of_birth, emergency_contact_name, emergency_contact_phone) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, bloodGroup || null, allergies || null, dateOfBirth || null, emergencyContact || null, emergencyPhone || null]
      );
    }
    const updatedUser = await pgQuery(
      'SELECT id, name, email, role, phone, city, avatar, created_at FROM users WHERE id = $1',
      [userId]
    );
    const updatedPatient = await pgQuery(
      'SELECT blood_group, allergies, date_of_birth, emergency_contact_name, emergency_contact_phone FROM patients WHERE user_id = $1',
      [userId]
    );
    const patient = updatedPatient.rows[0] || {};
    const completeUser = {
      ...updatedUser.rows[0],
      bloodGroup: patient.blood_group,
      allergies: patient.allergies,
      dateOfBirth: patient.date_of_birth,
      emergencyContact: patient.emergency_contact_name,
      emergencyPhone: patient.emergency_contact_phone
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: completeUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get complete doctor profile with all details
const getDoctorCompleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('====== GET DOCTOR COMPLETE PROFILE ======');
    console.log('User ID:', userId);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const userResult = await pgQuery(
      `SELECT id, name, email, role, phone, city, avatar, 
              TO_CHAR(created_at, 'Month YYYY') as member_since
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userResult.rows[0];
    const doctorResult = await pgQuery(
      `SELECT specialization, qualification, experience, fee, 
              hospital, rating, is_available
       FROM doctors WHERE user_id = $1`,
      [userId]
    );

    const doctor = doctorResult.rows[0] || {};
    const statsResult = await pgQuery(
      `SELECT 
         COUNT(DISTINCT patient_id) as total_patients,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
         COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_earnings
       FROM appointments 
       WHERE doctor_id = (SELECT id FROM doctors WHERE user_id = $1)`,
      [userId]
    );

    const stats = statsResult.rows[0] || {};
    const completeProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      avatar: user.avatar,
      memberSince: user.member_since?.trim() || 'January 2024',
      specialization: doctor.specialization || '',
      qualification: doctor.qualification || '',
      experience: parseInt(doctor.experience) || 0,
      fee: parseInt(doctor.fee) || 0,
      hospital: doctor.hospital || '',
      rating: parseFloat(doctor.rating) || 0,
      isAvailable: doctor.is_available || true,
      totalPatients: parseInt(stats.total_patients) || 0,
      completedAppointments: parseInt(stats.completed_appointments) || 0,
      pendingAppointments: parseInt(stats.pending_appointments) || 0,
      totalEarnings: parseInt(stats.total_earnings) || 0
    };

    console.log('Doctor complete profile fetched successfully');
    console.log('================================');

    res.json({ success: true, user: completeProfile });

  } catch (error) {
    console.error('Get doctor complete profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name, phone, city, specialization, qualification,
      experience, fee, hospital
    } = req.body;

    console.log('Update doctor profile for userId:', userId);
    await pgQuery(
      `UPDATE users SET name = $1, phone = $2, city = $3 WHERE id = $4`,
      [name, phone || null, city || null, userId]
    );
    await pgQuery(
      `UPDATE doctors SET 
        specialization = $1,
        qualification = $2,
        experience = $3,
        fee = $4,
        hospital = $5
       WHERE user_id = $6`,
      [specialization, qualification, experience, fee, hospital || null, userId]
    );
    const updatedUser = await pgQuery(
      'SELECT id, name, email, role, phone, city, avatar, TO_CHAR(created_at, \'Month YYYY\') as member_since FROM users WHERE id = $1',
      [userId]
    );
    const updatedDoctor = await pgQuery(
      'SELECT specialization, qualification, experience, fee, hospital, rating, is_available FROM doctors WHERE user_id = $1',
      [userId]
    );

    const doctor = updatedDoctor.rows[0] || {};

    const completeUser = {
      ...updatedUser.rows[0],
      memberSince: updatedUser.rows[0]?.member_since?.trim() || 'January 2024',
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      fee: doctor.fee,
      hospital: doctor.hospital,
      rating: doctor.rating,
      isAvailable: doctor.is_available
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: completeUser
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getUserById, uploadAvatar, updateProfile, getCompleteProfile, getDoctorCompleteProfile, updateDoctorProfile };