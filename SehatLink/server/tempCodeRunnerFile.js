const dotenv = require('dotenv');
dotenv.config();

async function testConnections() {
  console.log('\n🔍 Testing Database Connections...\n');
  console.log('=' .repeat(50));
  
  // Test PostgreSQL
  console.log('\n📊 POSTGRESQL:');
  try {
    const { sequelize } = require('./src/config/postgres');
    await sequelize.authenticate();
    console.log('   ✅ Connected successfully');
    console.log(`   Host: ${process.env.PG_HOST}:${process.env.PG_PORT}`);
    console.log(`   Database: ${process.env.PG_DATABASE}`);
    console.log(`   User: ${process.env.PG_USER}`);
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
  }
  
  // Test MongoDB
  console.log('\n🍃 MONGODB:');
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('   ✅ Connected successfully');
    console.log(`   URI: ${process.env.MONGO_URI.replace(/\/\/.*@/, '//<credentials>@')}`);
    await mongoose.disconnect();
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
  }
  
  // Test Neo4j
  console.log('\n🕸️  NEO4J:');
  try {
    const neo4j = require('neo4j-driver');
    const driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    await driver.verifyConnectivity();
    console.log('   ✅ Connected successfully');
    console.log(`   URI: ${process.env.NEO4J_URI}`);
    console.log(`   User: ${process.env.NEO4J_USER}`);
    await driver.close();
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Connection tests completed\n');
}

testConnections();