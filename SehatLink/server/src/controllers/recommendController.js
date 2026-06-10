const { pgQuery } = require('../db');
const { getMongoDB } = require('../db');
const { getNeo4jDriver } = require('../db');

// Intelligent Doctor Recommender using ALL THREE databases
const getIntelligentRecommendations = async (req, res) => {
  try {
    const { patientId, symptoms } = req.body;

    // ========== 1. PostgreSQL: Get patient history ==========
    const patientHistory = await pgQuery(
      `SELECT id, name, city FROM users WHERE id = $1 AND role = 'patient'`,
      [patientId]
    );

    if (patientHistory.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // ========== 2. Neo4j: Find doctors who treated similar patients ==========
    const driver = getNeo4jDriver();
    let neoRecommendations = [];
    
    if (driver && symptoms && symptoms.length > 0) {
      const session = driver.session();
      const neoResult = await session.run(
        `MATCH (p:Patient)-[:HAS_SYMPTOM]->(s:Symptom)
         WHERE s.name IN $symptoms
         MATCH (p)-[:VISITED]->(d:Doctor)
         RETURN d.id as doctorId, COUNT(DISTINCT p) as similarPatients
         ORDER BY similarPatients DESC
         LIMIT 10`,
        { symptoms }
      );
      
      neoRecommendations = neoResult.records.map(r => ({
        doctorId: parseInt(r.get('doctorId')),
        score: r.get('similarPatients')
      }));
      await session.close();
    }

    // ========== 3. PostgreSQL: Get doctor details ==========
    let doctors = [];
    if (neoRecommendations.length > 0) {
      const doctorIds = neoRecommendations.map(r => r.doctorId);
      const doctorResult = await pgQuery(
        `SELECT d.*, u.name, u.email, u.phone 
         FROM doctors d 
         JOIN users u ON d.user_id = u.id 
         WHERE d.id = ANY($1::int[]) AND d.is_available = true`,
        [doctorIds]
      );
      doctors = doctorResult.rows;
    } else {
      // Fallback: Get top rated doctors
      const doctorResult = await pgQuery(
        `SELECT d.*, u.name, u.email, u.phone 
         FROM doctors d 
         JOIN users u ON d.user_id = u.id 
         WHERE d.is_available = true 
         ORDER BY d.rating DESC 
         LIMIT 10`
      );
      doctors = doctorResult.rows;
    }

    // ========== 4. MongoDB: Get reviews and ratings ==========
    const mongoDb = getMongoDB();
    const doctorIds = doctors.map(d => d.id);
    const reviews = await mongoDb.collection('reviews').aggregate([
      { $match: { doctorId: { $in: doctorIds } } },
      { $group: { _id: '$doctorId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]).toArray();

    // Combine results
    const recommendations = doctors.map(doctor => {
      const review = reviews.find(r => r._id === doctor.id);
      const neoScore = neoRecommendations.find(n => n.doctorId === doctor.id);
      
      return {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        fee: doctor.fee,
        city: doctor.city,
        rating: review?.avgRating || doctor.rating || 0,
        reviewCount: review?.count || 0,
        recommendationScore: (neoScore?.score || 0) + (review?.avgRating || 0)
      };
    });

    recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.json({
      success: true,
      message: 'Recommendations generated using PostgreSQL, MongoDB, and Neo4j',
      recommendations: recommendations.slice(0, 5)
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getIntelligentRecommendations };