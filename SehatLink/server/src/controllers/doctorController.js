const { pgQuery } = require('../db');

// Get all doctors - ONLY ACTIVE DOCTORS
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, city } = req.query;
    let sql = `
      SELECT d.*, u.name, u.email, u.phone, u.is_active
      FROM doctors d 
      JOIN users u ON d.user_id = u.id 
      WHERE u.role = 'doctor' 
      AND u.is_active = true
      AND d.is_available = true
    `;
    const params = [];
    if (specialization) {
      params.push(specialization);
      sql += ` AND d.specialization = $${params.length}`;
    }
    if (city) {
      params.push(city);
      sql += ` AND d.city = $${params.length}`;
    }
    sql += ` ORDER BY d.rating DESC NULLS LAST`;
    console.log('Executing SQL:', sql);
    console.log('Params:', params);
    const result = await pgQuery(sql, params);
    console.log(`Found ${result.rows.length} active doctors`);
    res.json({ success: true, doctors: result.rows });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor by ID - ONLY if ACTIVE
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pgQuery(
      `SELECT d.*, u.name, u.email, u.phone, u.is_active, u.avatar
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.id = $1 AND u.role = 'doctor'`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }
    const doctor = result.rows[0];
    if (!doctor.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'This doctor is currently not accepting appointments',
        doctor: doctor,
        isActive: false
      });
    }
    res.json({ 
      success: true, 
      doctor: doctor,
      isActive: true 
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search doctors - ONLY ACTIVE DOCTORS
const searchDoctors = async (req, res) => {
  try {
    const { q } = req.query;
    const result = await pgQuery(
      `SELECT d.*, u.name, u.is_active
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE u.role = 'doctor'
       AND u.is_active = true
       AND d.is_available = true 
       AND (u.name ILIKE $1 OR d.specialization ILIKE $1)
       LIMIT 20`,
      [`%${q}%`]
    );
    res.json({ success: true, doctors: result.rows });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add review (placeholder)
const addReview = async (req, res) => {
  res.json({ success: true, message: 'Review added' });
};

// Get doctor by user ID (for doctor's own profile - includes inactive)
const getDoctorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pgQuery(
      `SELECT d.*, u.name, u.email, u.phone, u.is_active
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.user_id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, doctor: result.rows[0] });
  } catch (error) {
    console.error('Get doctor by user ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor patients
const getDoctorPatients = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('====== GET DOCTOR PATIENTS ======');
    console.log('userId from query:', userId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }
    const doctorResult = await pgQuery(
      `SELECT id FROM doctors WHERE user_id = $1`,
      [userIdInt]
    );
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    const doctorId = doctorResult.rows[0].id;
    const patients = await pgQuery(
      `SELECT DISTINCT 
        u.id, u.name, u.email, u.phone, u.city, u.is_active,
        p.blood_group, p.allergies,
        MAX(a.appointment_date) as last_visit,
        COUNT(a.id) as total_visits
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       LEFT JOIN patients p ON u.id = p.user_id
       WHERE a.doctor_id = $1 AND a.status IN ('completed', 'confirmed')
       GROUP BY u.id, u.name, u.email, u.phone, u.city, p.blood_group, p.allergies, u.is_active
       ORDER BY last_visit DESC`,
      [doctorId]
    );
    res.json({ success: true, patients: patients.rows });
  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient medical history (placeholder)
const getPatientMedicalHistory = async (req, res) => {
  res.json({ success: true, appointments: [], prescriptions: [] });
};

// Get doctor earnings
const getDoctorEarnings = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('====== GET DOCTOR EARNINGS ======');
    console.log('userId:', userId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const doctorResult = await pgQuery(
      `SELECT id FROM doctors WHERE user_id = $1`,
      [userId]
    );
    console.log('Doctor query result:', doctorResult.rows);
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }    
    const doctorId = doctorResult.rows[0].id;
    console.log('Doctor ID:', doctorId);
    const allAppointmentsCheck = await pgQuery(
      `SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1`,
      [doctorId]
    );
    console.log('Total appointments for doctor:', allAppointmentsCheck.rows[0].count);
    const totalResult = await pgQuery(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM appointments 
       WHERE doctor_id = $1 AND status = 'completed'`,
      [doctorId]
    );
    console.log('Total completed amount:', totalResult.rows[0].total);
    const thisMonthResult = await pgQuery(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM appointments 
       WHERE doctor_id = $1 
       AND status = 'completed' 
       AND EXTRACT(YEAR FROM appointment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM appointment_date) = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [doctorId]
    );
    console.log('This month amount:', thisMonthResult.rows[0].total);
    const lastMonthResult = await pgQuery(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM appointments 
       WHERE doctor_id = $1 
       AND status = 'completed' 
       AND EXTRACT(YEAR FROM appointment_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
       AND EXTRACT(MONTH FROM appointment_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')`,
      [doctorId]
    );
    console.log('Last month amount:', lastMonthResult.rows[0].total);
    const pendingResult = await pgQuery(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM appointments 
       WHERE doctor_id = $1 AND status = 'confirmed'`,
      [doctorId]
    );
    console.log('Pending amount:', pendingResult.rows[0].total);
    const completedResult = await pgQuery(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM appointments 
       WHERE doctor_id = $1 AND status = 'completed'`,
      [doctorId]
    );
    const transactions = await pgQuery(
      `SELECT a.id, a.amount, a.appointment_date as date, a.status,
              u.name as patient_name, a.id as appointment_id
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = $1
       ORDER BY a.appointment_date DESC
       LIMIT 20`,
      [doctorId]
    );
    console.log('Transactions found:', transactions.rows.length);
    const earningsData = {
      total: parseFloat(totalResult.rows[0].total),
      thisMonth: parseFloat(thisMonthResult.rows[0].total),
      lastMonth: parseFloat(lastMonthResult.rows[0].total),
      pending: parseFloat(pendingResult.rows[0].total),
      completed: parseFloat(completedResult.rows[0].total)
    };
    console.log('Final earnings data:', earningsData);
    console.log('================================');
    res.json({
      success: true,
      earnings: earningsData,
      transactions: transactions.rows.map(t => ({
        id: t.id,
        patient: t.patient_name,
        amount: parseFloat(t.amount),
        date: t.date,
        status: t.status,
        appointmentId: t.appointment_id
      }))
    });
  } catch (error) {
    console.error('Get doctor earnings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor's available time slots
const getDoctorAvailableSlots = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { date } = req.query;
    console.log('====== GET AVAILABLE SLOTS ======');
    console.log('Doctor ID:', doctorId);
    console.log('Date:', date);
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'Doctor ID and date are required' });
    }
    const doctorIdInt = parseInt(doctorId);
    if (isNaN(doctorIdInt)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    const doctorCheck = await pgQuery(
      `SELECT u.is_active FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.id = $1 AND u.role = 'doctor'`,
      [doctorIdInt]
    );
    if (doctorCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }
    if (!doctorCheck.rows[0].is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'This doctor is currently not accepting appointments' 
      });
    }
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
    const bookedResult = await pgQuery(
      `SELECT appointment_date 
       FROM appointments 
       WHERE doctor_id = $1 AND DATE(appointment_date) = $2 AND status NOT IN ('cancelled')`,
      [doctorIdInt, date]
    );
    const bookedTimes = bookedResult.rows.map(row => {
      const d = new Date(row.appointment_date);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    });
    console.log('Booked times:', bookedTimes);
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
    console.log('Available slots:', availableSlots);
    console.log('================================');
    res.json({ success: true, slots: availableSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    const defaultSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00'
    ];
    res.json({ success: true, slots: defaultSlots });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  searchDoctors,
  addReview,
  getDoctorByUserId,
  getDoctorPatients,
  getPatientMedicalHistory,
  getDoctorEarnings,
  getDoctorAvailableSlots
};