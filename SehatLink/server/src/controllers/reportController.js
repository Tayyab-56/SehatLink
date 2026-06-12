const { getMongoDB } = require('../db');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uploadReport = async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST RECEIVED ===');
    console.log('Body:', req.body);
    console.log('File:', req.file ? req.file.filename : 'No file');
    const { patientId, title, reportType, description, results, doctorId, appointmentId } = req.body;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: 'Report title is required' });
    }
    if (!reportType) {
      return res.status(400).json({ success: false, message: 'Report type is required' });
    }
    const mongoDb = getMongoDB();
    let parsedResults = {};
    if (results) {
      try {
        parsedResults = typeof results === 'string' ? JSON.parse(results) : results;
      } catch (e) {
        console.log('Results parsing error:', e.message);
        parsedResults = { raw: results };
      }
    }
    const report = {
      patientId: parseInt(patientId),
      reportType: reportType,
      title: title,
      description: description || '',
      results: parsedResults,
      doctorId: doctorId ? parseInt(doctorId) : null,
      appointmentId: appointmentId ? parseInt(appointmentId) : null,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      fileType: req.file ? req.file.mimetype : null,
      fileSize: req.file ? req.file.size : null,
      originalFileName: req.file ? req.file.originalname : null,
      isAbnormal: false,
      createdBy: req.body.createdBy || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await mongoDb.collection('reports').insertOne(report);
    console.log('✅ Report saved with ID:', result.insertedId);
    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      report: { ...report, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Upload report error:', error);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('File deleted due to error:', req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload report'
    });
  }
};

// Get all reports for a patient
const getPatientReports = async (req, res) => {
  try {
    const patientId = req.query.patientId;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }
    const mongoDb = getMongoDB();
    const reports = await mongoDb.collection('reports')
      .find({ patientId: parseInt(patientId) })
      .sort({ createdAt: -1 })
      .toArray();
    console.log(`Found ${reports.length} reports for patient ${patientId}`);
    res.json({
      success: true,
      reports: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoDb = getMongoDB();
    let report;
    try {
      report = await mongoDb.collection('reports').findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoDb = getMongoDB();
    const report = await mongoDb.collection('reports').findOne({ _id: new ObjectId(id) });
    const result = await mongoDb.collection('reports').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    if (report && report.fileUrl) {
      const filePath = path.join(__dirname, '../../', report.fileUrl);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('File deleted:', filePath);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadReport,
  getPatientReports,
  getReportById,
  deleteReport
};