const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
// ==================== PostgreSQL =====================
const pgPool = new Pool({
  host: process.env.PG_HOST || '',
  port: process.env.PG_PORT ,
  user: process.env.PG_USER || '',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || '',
  max: 20,
  idleTimeoutMillis: 30000,
});
const pgQuery = (text, params) => pgPool.query(text, params);
// ==================== MongoDB =====================
let mongoClient;
let mongoDb;
const connectMongoDB = async () => {
  try {
    mongoClient = new MongoClient(process.env.MONGO_URI || '');
    await mongoClient.connect();
    mongoDb = mongoClient.db(process.env.MONGO_DB_NAME || '');
    console.log('✅ MongoDB connected');
    return mongoDb;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};
const getMongoDB = () => mongoDb;

// ==================== Neo4j ====================
let neo4jDriver = null;
const connectNeo4j = async () => {
    try {
        const neo4jUri = process.env.NEO4J_URI || '';
        const neo4jUser = process.env.NEO4J_USER || '';
        const neo4jPassword = process.env.NEO4J_PASSWORD || '';
        const neo4jDatabase = '';
        neo4jDriver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
        await neo4jDriver.verifyConnectivity();
        const session = neo4jDriver.session({ database: neo4jDatabase });
        const result = await session.run('RETURN 1 as test');
        console.log('✅ Neo4j connected to database:', neo4jDatabase);
        await session.close();
        return neo4jDriver;
    } catch (error) {
        console.error('Neo4j connection error:', error);
        return null;
    }
};

const getNeo4jDriver = () => {
  if (!neo4jDriver) {
    console.log('⚠️ Neo4j driver not initialized. Call connectNeo4j() first.');
  }
  return neo4jDriver;
};

const closeNeo4j = async () => {
  if (neo4jDriver) {
    await neo4jDriver.close();
    console.log('Neo4j connection closed');
    neo4jDriver = null;
  }
};

// ==================== Test All Connections ====================
const testConnections = async () => {
  let allConnected = true;
  console.log('\n🔌 Testing Database Connections...\n');
  try {
    await pgPool.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    allConnected = false;
  }
  try {
    await connectMongoDB();
  } catch (error) {
    allConnected = false;
  }
  await connectNeo4j();  
  return allConnected;
};

module.exports = {
  pgQuery,
  pgPool,
  connectMongoDB,
  getMongoDB,
  connectNeo4j,
  getNeo4jDriver,
  closeNeo4j,
  testConnections
};