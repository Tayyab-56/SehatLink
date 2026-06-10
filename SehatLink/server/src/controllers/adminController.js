const { pgQuery } = require("../db");
const { getMongoDB } = require("../db");
const { getNeo4jDriver } = require("../db");

const getDashboardStats = async (req, res) => {
  try {
    console.log("=== GET DASHBOARD STATS ===");
    // PostgreSQL stats
    const totalPatients = await pgQuery(
      `SELECT COUNT(*) as count FROM users WHERE role = 'patient'`,
    );
    const totalDoctors = await pgQuery(
      `SELECT COUNT(*) as count FROM users WHERE role = 'doctor'`,
    );
    const totalAdmins = await pgQuery(
      `SELECT COUNT(*) as count FROM users WHERE role = 'admin'`,
    );
    const totalUsers = await pgQuery(`SELECT COUNT(*) as count FROM users`);
    const totalAppointments = await pgQuery(
      `SELECT COUNT(*) as count FROM appointments`,
    );
    const pendingAppointments = await pgQuery(
      `SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'`,
    );
    const completedAppointments = await pgQuery(
      `SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'`,
    );

    let totalRevenue = 0;
    try {
      const revenueResult = await pgQuery(
        `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`,
      );
      totalRevenue = parseInt(revenueResult.rows[0].total) || 0;
    } catch (error) {
      console.log("Payments table may not exist yet");
    }
    // MongoDB stats
    let totalReports = 0;
    let totalReviews = 0;
    try {
      const mongoDb = getMongoDB();
      if (mongoDb) {
        totalReports = await mongoDb.collection("reports").countDocuments();
        totalReviews = await mongoDb.collection("reviews").countDocuments();
      }
    } catch (error) {
      console.error("MongoDB stats error:", error);
    }
    // Neo4j stats
    let referralCount = 0;
    try {
      const driver = getNeo4jDriver();
      if (driver) {
        const session = driver.session();
        const neoResult = await session.run(
          `MATCH ()-[:REFERRED_TO]->() RETURN COUNT(*) as count`,
        );
        referralCount = neoResult.records[0].get("count").toNumber();
        await session.close();
      }
    } catch (error) {
      console.error("Neo4j stats error:", error);
    }

    const stats = {
      patients: parseInt(totalPatients.rows[0].count) || 0,
      doctors: parseInt(totalDoctors.rows[0].count) || 0,
      admins: parseInt(totalAdmins.rows[0].count) || 0,
      totalUsers: parseInt(totalUsers.rows[0].count) || 0,
      appointments: parseInt(totalAppointments.rows[0].count) || 0,
      pendingAppointments: parseInt(pendingAppointments.rows[0].count) || 0,
      completedAppointments: parseInt(completedAppointments.rows[0].count) || 0,
      revenue: totalRevenue,
      reports: totalReports || 0,
      reviews: totalReviews || 0,
      referrals: referralCount || 0,
    };
    res.json({ success: true, stats });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== USER MANAGEMENT ====================
// Get all users
const getAllUsers = async (req, res) => {
  try {
    console.log("=== GET ALL USERS ===");
    const result = await pgQuery(
      `SELECT id, name, email, role, phone, city, avatar, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC`,
    );
    const users = result.rows.map((user) => ({
      ...user,
      status: user.is_active ? "active" : "inactive",
    }));
    console.log(`Found ${users.length} users`);
    res.json({ success: true, users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pgQuery(
      `SELECT id, name, email, role, phone, city, avatar, is_active, created_at 
       FROM users 
       WHERE id = $1`,
      [userId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const user = {
      ...result.rows[0],
      status: result.rows[0].is_active ? "active" : "inactive",
    };
    res.json({ success: true, user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    console.log(`Updating user ${userId} status to ${status}`);
    const is_active = status === "active";
    if (!["active", "inactive", "suspended"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
    const userCheck = await pgQuery(
      `SELECT id, role FROM users WHERE id = $1`,
      [userId],
    );
    if (userCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (userCheck.rows[0].role === "admin" && !is_active) {
      const adminCount = await pgQuery(
        `SELECT COUNT(*) as count FROM users WHERE role = 'admin'`,
      );
      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot deactivate the last admin",
        });
      }
    }

    await pgQuery(`UPDATE users SET is_active = $1 WHERE id = $2`, [
      is_active,
      userId,
    ]);

    res.json({
      success: true,
      message: `User ${is_active ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, city } = req.body;
    console.log(`Updating user ${userId}:`, { name, email, phone, city });
    const result = await pgQuery(
      `UPDATE users SET name = $1, email = $2, phone = $3, city = $4 
       WHERE id = $5 
       RETURNING id, name, email, phone, city, role, is_active`,
      [name, email, phone, city, userId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const user = {
      ...result.rows[0],
      status: result.rows[0].is_active ? "active" : "inactive",
    };
    res.json({ success: true, user, message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Deleting user ${userId}`);
    const userCheck = await pgQuery(
      `SELECT id, role FROM users WHERE id = $1`,
      [userId],
    );
    if (userCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (userCheck.rows[0].role === "admin") {
      const adminCount = await pgQuery(
        `SELECT COUNT(*) as count FROM users WHERE role = 'admin'`,
      );
      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res
          .status(400)
          .json({ success: false, message: "Cannot delete the last admin" });
      }
    }
    if (userCheck.rows[0].role === "doctor") {
      const doctorResult = await pgQuery(
        `SELECT id FROM doctors WHERE user_id = $1`,
        [userId],
      );
      if (doctorResult.rows.length > 0) {
        const doctorId = doctorResult.rows[0].id;
        await pgQuery(`DELETE FROM appointments WHERE doctor_id = $1`, [
          doctorId,
        ]);
        await pgQuery(`DELETE FROM doctors WHERE user_id = $1`, [userId]);
      }
    } else if (userCheck.rows[0].role === "patient") {
      await pgQuery(`DELETE FROM appointments WHERE patient_id = $1`, [userId]);
      await pgQuery(`DELETE FROM patients WHERE user_id = $1`, [userId]);
    }
    await pgQuery(`DELETE FROM users WHERE id = $1`, [userId]);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent users
const getRecentUsers = async (req, res) => {
  try {
    const result = await pgQuery(
      `SELECT id, name, email, role, phone, city, avatar, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 10`,
    );
    const users = result.rows.map((user) => ({
      ...user,
      status: user.is_active ? "active" : "inactive",
    }));
    res.json({ success: true, users });
  } catch (error) {
    console.error("Get recent users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DOCTOR MANAGEMENT ====================
// Get all doctors with details including statistics
const getAllDoctors = async (req, res) => {
  try {
    console.log("=== GET ALL DOCTORS ===");

    const result = await pgQuery(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.city, u.is_active, u.created_at, u.avatar,
        d.id as doctor_db_id,
        d.specialization, d.qualification, d.experience, d.fee, d.hospital, d.rating,
        COALESCE((SELECT COUNT(*) FROM appointments WHERE doctor_id = d.id), 0) as total_appointments,
        COALESCE((SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = d.id), 0) as total_patients,
        COALESCE((SELECT SUM(amount) FROM appointments WHERE doctor_id = d.id AND status = 'completed'), 0) as total_earnings
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      WHERE u.role = 'doctor'
      ORDER BY u.created_at DESC`,
    );
    const doctors = result.rows.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      city: doctor.city,
      is_active: doctor.is_active,
      status: doctor.is_active ? "active" : "inactive",
      created_at: doctor.created_at,
      avatar: doctor.avatar,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: parseInt(doctor.experience) || 0,
      fee: parseInt(doctor.fee) || 0,
      hospital: doctor.hospital,
      rating: parseFloat(doctor.rating) || 0,
      totalAppointments: parseInt(doctor.total_appointments) || 0,
      totalPatients: parseInt(doctor.total_patients) || 0,
      totalEarnings: parseInt(doctor.total_earnings) || 0,
    }));
    console.log(`Found ${doctors.length} doctors with stats`);
    res.json({ success: true, doctors });
  } catch (error) {
    console.error("Get all doctors error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor by ID with full details
const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await pgQuery(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.city, u.is_active, u.created_at, u.avatar,
        d.id as doctor_db_id,
        d.specialization, d.qualification, d.experience, d.fee, d.hospital, d.rating,
        COALESCE((SELECT COUNT(*) FROM appointments WHERE doctor_id = d.id), 0) as total_appointments,
        COALESCE((SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = d.id), 0) as total_patients,
        COALESCE((SELECT SUM(amount) FROM appointments WHERE doctor_id = d.id AND status = 'completed'), 0) as total_earnings
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      WHERE u.id = $1 AND u.role = 'doctor'`,
      [doctorId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    const doctor = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      city: result.rows[0].city,
      is_active: result.rows[0].is_active,
      status: result.rows[0].is_active ? "active" : "inactive",
      created_at: result.rows[0].created_at,
      avatar: result.rows[0].avatar,
      specialization: result.rows[0].specialization,
      qualification: result.rows[0].qualification,
      experience: parseInt(result.rows[0].experience) || 0,
      fee: parseInt(result.rows[0].fee) || 0,
      hospital: result.rows[0].hospital,
      rating: parseFloat(result.rows[0].rating) || 0,
      totalAppointments: parseInt(result.rows[0].total_appointments) || 0,
      totalPatients: parseInt(result.rows[0].total_patients) || 0,
      totalEarnings: parseInt(result.rows[0].total_earnings) || 0,
    };
    res.json({ success: true, doctor });
  } catch (error) {
    console.error("Get doctor error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor status
const updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;
    console.log(`Updating doctor ${doctorId} status to ${status}`);
    const is_active = status === "active";
    if (!["active", "inactive", "pending"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
    const doctorCheck = await pgQuery(
      `SELECT id FROM users WHERE id = $1 AND role = 'doctor'`,
      [doctorId],
    );
    if (doctorCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    await pgQuery(`UPDATE users SET is_active = $1 WHERE id = $2`, [
      is_active,
      doctorId,
    ]);
    res.json({
      success: true,
      message: `Doctor ${is_active ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Update doctor status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor profile
const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const {
      name,
      email,
      phone,
      city,
      specialization,
      qualification,
      experience,
      fee,
      hospital,
    } = req.body;
    console.log(`Updating doctor ${doctorId}`);
    await pgQuery(
      `UPDATE users SET name = $1, email = $2, phone = $3, city = $4 WHERE id = $5`,
      [name, email, phone, city, doctorId],
    );
    await pgQuery(
      `UPDATE doctors SET specialization = $1, qualification = $2, experience = $3, fee = $4, hospital = $5 WHERE user_id = $6`,
      [specialization, qualification, experience, fee, hospital, doctorId],
    );
    res.json({ success: true, message: "Doctor updated successfully" });
  } catch (error) {
    console.error("Update doctor error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log(`Deleting doctor ${doctorId}`);
    const doctorCheck = await pgQuery(
      `SELECT id FROM users WHERE id = $1 AND role = 'doctor'`,
      [doctorId],
    );
    if (doctorCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    const docResult = await pgQuery(
      `SELECT id FROM doctors WHERE user_id = $1`,
      [doctorId],
    );
    if (docResult.rows.length > 0) {
      const dbDoctorId = docResult.rows[0].id;
      await pgQuery(`DELETE FROM appointments WHERE doctor_id = $1`, [
        dbDoctorId,
      ]);
      await pgQuery(`DELETE FROM doctors WHERE user_id = $1`, [doctorId]);
    }
    await pgQuery(`DELETE FROM users WHERE id = $1`, [doctorId]);
    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== APPOINTMENT MANAGEMENT ====================
// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    console.log("=== GET ALL APPOINTMENTS ===");

    const result = await pgQuery(
      `SELECT 
        a.id, a.patient_id, a.doctor_id, a.appointment_date, a.status, 
        a.amount, a.symptoms, a.created_at, a.updated_at,
        p.name as patient_name, 
        p.phone as patient_phone,
        p.email as patient_email,
        du.name as doctor_name,
        d.specialization,
        d.fee as doctor_fee
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      ORDER BY a.appointment_date DESC`,
    );

    console.log(`Found ${result.rows.length} appointments`);
    res.json({ success: true, appointments: result.rows });
  } catch (error) {
    console.error("Get all appointments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const result = await pgQuery(
      `SELECT 
        a.*, 
        p.name as patient_name, 
        p.phone as patient_phone,
        p.email as patient_email,
        du.name as doctor_name,
        d.specialization, 
        d.fee
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE a.id = $1`,
      [appointmentId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, appointment: result.rows[0] });
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent appointments
const getRecentAppointments = async (req, res) => {
  try {
    const result = await pgQuery(
      `SELECT 
        a.*, 
        p.name as patient_name, 
        du.name as doctor_name,
        d.specialization
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      ORDER BY a.created_at DESC 
      LIMIT 10`,
    );

    res.json({ success: true, appointments: result.rows });
  } catch (error) {
    console.error("Get recent appointments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    console.log(`Updating appointment ${appointmentId} status to ${status}`);
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
    await pgQuery(
      `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, appointmentId],
    );
    res.json({
      success: true,
      message: "Appointment status updated successfully",
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment details
const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { appointment_date, status, amount, symptoms } = req.body;
    console.log(`Updating appointment ${appointmentId}`);
    const result = await pgQuery(
      `UPDATE appointments 
       SET appointment_date = $1, status = $2, amount = $3, symptoms = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [appointment_date, status, amount, symptoms, appointmentId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }
    res.json({
      success: true,
      appointment: result.rows[0],
      message: "Appointment updated successfully",
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    console.log(`Deleting appointment ${appointmentId}`);
    const result = await pgQuery(
      `DELETE FROM appointments WHERE id = $1 RETURNING id`,
      [appointmentId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }
    res.json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointment statistics
const getAppointmentStats = async (req, res) => {
  try {
    const result = await pgQuery(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN amount END), 0) as avg_amount
      FROM appointments`,
    );
    res.json({ success: true, stats: result.rows[0] });
  } catch (error) {
    console.error("Get appointment stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointments by date range
const getAppointmentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await pgQuery(
      `SELECT 
        a.*, 
        p.name as patient_name, 
        du.name as doctor_name,
        d.specialization
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE a.appointment_date BETWEEN $1 AND $2
      ORDER BY a.appointment_date DESC`,
      [startDate, endDate],
    );
    res.json({ success: true, appointments: result.rows });
  } catch (error) {
    console.error("Get appointments by date range error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRecentUsers,
  getRecentAppointments,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getAllDoctors,
  getDoctorById,
  updateDoctorStatus,
  updateDoctor,
  deleteDoctor,
  getAllAppointments,
  getAppointmentById,
  getAppointmentStats,
  getAppointmentsByDateRange,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
};