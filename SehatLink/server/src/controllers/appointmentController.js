const { pgQuery } = require("../db");

// Get my appointments
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log("Fetching appointments for userId:", userId);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required. Please login again.",
      });
    }
    const userResult = await pgQuery(
      `SELECT id, role, is_active FROM users WHERE id = $1`,
      [userId],
    );
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const userRole = userResult.rows[0].role;
    let appointments = [];
    if (userRole === "patient") {
      const result = await pgQuery(
        `SELECT a.*, 
                d.id as doctor_db_id,
                d.specialization, 
                d.fee, 
                d.city as doctor_city,
                u.name as doctor_name,
                u.phone as doctor_phone,
                u.email as doctor_email,
                u.is_active as doctor_active
         FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         JOIN users u ON d.user_id = u.id
         WHERE a.patient_id = $1
         ORDER BY a.appointment_date DESC`,
        [userId],
      );
      appointments = result.rows;
      console.log(
        `Found ${appointments.length} appointments for patient ${userId}`,
      );
    } else if (userRole === "doctor") {
      const doctorResult = await pgQuery(
        `SELECT id FROM doctors WHERE user_id = $1`,
        [userId],
      );
      const doctorId = doctorResult.rows[0]?.id;
      if (doctorId) {
        const result = await pgQuery(
          `SELECT a.*, 
                  u.id as patient_user_id,
                  u.name as patient_name,
                  u.phone as patient_phone,
                  u.email as patient_email,
                  u.is_active as patient_active
           FROM appointments a
           JOIN users u ON a.patient_id = u.id
           WHERE a.doctor_id = $1
           ORDER BY a.appointment_date DESC`,
          [doctorId],
        );
        appointments = result.rows;
        console.log(
          `Found ${appointments.length} appointments for doctor ${doctorId}`,
        );
      }
    } else {
      const result = await pgQuery(
        `SELECT a.*, 
                p.name as patient_name, 
                p.email as patient_email,
                doc.name as doctor_name,
                doc.email as doctor_email,
                d.specialization
         FROM appointments a
         JOIN users p ON a.patient_id = p.id
         JOIN doctors d ON a.doctor_id = d.id
         JOIN users doc ON d.user_id = doc.id
         ORDER BY a.appointment_date DESC`,
      );
      appointments = result.rows;
    }
    res.json({ success: true, appointments: appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, symptoms, patientId } = req.body;
    console.log("Booking appointment:", {
      doctorId,
      appointmentDate,
      patientId,
    });
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required. Please login again.",
      });
    }
    if (!doctorId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is required" });
    }
    if (!appointmentDate) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment date is required" });
    }
    const patientCheck = await pgQuery(
      `SELECT id, name, is_active FROM users WHERE id = $1 AND role = 'patient'`,
      [patientId],
    );
    if (patientCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
    if (!patientCheck.rows[0].is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact support.",
      });
    }

    const doctorResult = await pgQuery(
      `SELECT d.*, u.name as doctor_name, u.is_active as doctor_active
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.id = $1`,
      [doctorId],
    );
    if (doctorResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    const doctor = doctorResult.rows[0];
    if (!doctor.doctor_active) {
      return res.status(403).json({
        success: false,
        message:
          "This doctor is currently not accepting appointments. Please select another doctor.",
      });
    }
    const amount = doctor.fee;
    const existing = await pgQuery(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND status != 'cancelled'`,
      [doctorId, appointmentDate],
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This time slot is already booked. Please select another time.",
      });
    }
    const result = await pgQuery(
      `INSERT INTO appointments 
       (patient_id, doctor_id, appointment_date, symptoms, amount, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'pending')
       RETURNING *`,
      [patientId, doctorId, appointmentDate, symptoms || "", amount],
    );
    const newAppointment = result.rows[0];
    console.log("Appointment created:", newAppointment);
    res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const userCheck = await pgQuery(
      `SELECT is_active FROM users WHERE id = $1`,
      [userId],
    );
    if (userCheck.rows.length === 0 || !userCheck.rows[0].is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is deactivated" });
    }
    const appointment = await pgQuery(
      `SELECT patient_id, doctor_id, status FROM appointments WHERE id = $1`,
      [id],
    );
    if (appointment.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }
    const apt = appointment.rows[0];
    if (apt.patient_id != userId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own appointments",
      });
    }
    if (apt.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Appointment is already cancelled" });
    }
    if (apt.status === "completed") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Completed appointments cannot be cancelled",
        });
    }
    await pgQuery(
      `UPDATE appointments SET status = 'cancelled' WHERE id = $1`,
      [id],
    );
    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointments specifically for doctor dashboard
const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log("getDoctorAppointments called for userId:", userId);
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const doctorUserCheck = await pgQuery(
      `SELECT is_active FROM users WHERE id = $1 AND role = 'doctor'`,
      [userId],
    );
    if (
      doctorUserCheck.rows.length === 0 ||
      !doctorUserCheck.rows[0].is_active
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is deactivated" });
    }
    const doctorResult = await pgQuery(
      `SELECT id FROM doctors WHERE user_id = $1`,
      [userId],
    );
    console.log("Doctor result:", doctorResult.rows);
    if (doctorResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    const doctorId = doctorResult.rows[0].id;
    const appointments = await pgQuery(
      `SELECT a.*, 
              u.id as patient_user_id,
              u.name as patient_name, 
              u.phone as patient_phone,
              u.email as patient_email,
              u.is_active as patient_active
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = $1
       ORDER BY a.appointment_date DESC`,
      [doctorId],
    );
    console.log(
      `Found ${appointments.rows.length} appointments for doctor ${doctorId}`,
    );
    res.json({ success: true, appointments: appointments.rows });
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId } = req.body;
    console.log("updateAppointmentStatus called:", { id, status, userId });
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const userCheck = await pgQuery(
      `SELECT id, role, is_active FROM users WHERE id = $1`,
      [userId],
    );
    if (userCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!userCheck.rows[0].is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is deactivated" });
    }
    const userRole = userCheck.rows[0].role;
    if (userRole === "doctor") {
      const doctorResult = await pgQuery(
        `SELECT id FROM doctors WHERE user_id = $1`,
        [userId],
      );
      if (doctorResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Doctor not found" });
      }
      const doctorId = doctorResult.rows[0].id;
      const appointmentCheck = await pgQuery(
        `SELECT id FROM appointments WHERE id = $1 AND doctor_id = $2`,
        [id, doctorId],
      );
      if (appointmentCheck.rows.length === 0) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorized to update this appointment",
          });
      }
    } else if (userRole === "patient") {
      const appointmentCheck = await pgQuery(
        `SELECT id FROM appointments WHERE id = $1 AND patient_id = $2`,
        [id, userId],
      );
      if (appointmentCheck.rows.length === 0) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorized to update this appointment",
          });
      }
    }
    await pgQuery(`UPDATE appointments SET status = $1 WHERE id = $2`, [
      status,
      id,
    ]);
    console.log(`Appointment ${id} status updated to ${status}`);
    res.json({ success: true, message: `Appointment ${status} successfully` });
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointment by ID for doctor view
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pgQuery(
      `SELECT a.*, 
              p.id as patient_id, p.name as patient_name, p.phone as patient_phone, p.email as patient_email, p.is_active as patient_active,
              d.id as doctor_id, d.specialization,
              u.name as doctor_name, u.is_active as doctor_active
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE a.id = $1`,
      [id],
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

// Get list of active doctors for patient booking
const getActiveDoctors = async (req, res) => {
  try {
    const { specialization, city } = req.query;

    let query = `
      SELECT d.*, u.name, u.email, u.phone, u.city, u.is_active
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.role = 'doctor' 
      AND u.is_active = true
      AND d.is_available = true
    `;
    const params = [];
    let paramIndex = 1;
    if (specialization && specialization !== "all") {
      query += ` AND d.specialization = $${paramIndex}`;
      params.push(specialization);
      paramIndex++;
    }
    if (city && city !== "all") {
      query += ` AND u.city = $${paramIndex}`;
      params.push(city);
      paramIndex++;
    }
    query += ` ORDER BY d.rating DESC NULLS LAST`;
    const result = await pgQuery(query, params);
    console.log(`Found ${result.rows.length} active doctors`);
    res.json({ success: true, doctors: result.rows });
  } catch (error) {
    console.error("Get active doctors error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single active doctor by ID
const getActiveDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pgQuery(
      `SELECT d.*, u.name, u.email, u.phone, u.city, u.is_active, u.avatar
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1 AND u.role = 'doctor' AND u.is_active = true`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or currently not accepting appointments",
      });
    }
    res.json({ success: true, doctor: result.rows[0] });
  } catch (error) {
    console.error("Get active doctor error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyAppointments,
  bookAppointment,
  cancelAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  getActiveDoctors,
  getActiveDoctorById,
};
