// server/src/controllers/chatbotController.js
const { getMongoDB } = require('../db');
const { getNeo4jDriver } = require('../db');
const { v4: uuidv4 } = require('uuid');
const sehatlinkModel = require('../services/sehatlinkModel');

const getChatbotCollection = () => {
    const db = getMongoDB();
    return db.collection('chatbot_conversations');
};

// Intelligent symptom extraction
const extractSymptoms = (message) => {
    const symptomMap = {
        'fever': ['fever', 'feaver', 'feverish', 'high temperature', 'hot', 'temperature', 'high temp', 'warm', 'burning up'],
        'cough': ['cough', 'coughing', 'dry cough', 'wet cough', 'productive cough', 'coughing fits'],
        'fatigue': ['fatigue', 'tired', 'exhausted', 'weakness', 'low energy', 'lethargy', 'sleepy', 'drained'],
        'headache': ['headache', 'head pain', 'migraine', 'throbbing head', 'head hurting'],
        'nausea': ['nausea', 'queasy', 'sick stomach', 'stomach upset', 'nauseous'],
        'vomiting': ['vomiting', 'throwing up', 'puking', 'vomited'],
        'chest pain': ['chest pain', 'chest discomfort', 'tight chest', 'chest tightness', 'pain in chest'],
        'shortness of breath': ['shortness of breath', 'difficulty breathing', "can't breathe", 'breathless', 'struggling to breathe'],
        'runny nose': ['runny nose', 'stuffy nose', 'nasal congestion', 'blocked nose', 'congested'],
        'sore throat': ['sore throat', 'scratchy throat', 'painful swallowing', 'throat pain'],
        'muscle aches': ['muscle aches', 'body aches', 'muscle pain', 'myalgia', 'sore muscles'],
        'dizziness': ['dizziness', 'vertigo', 'lightheaded', 'spinning', 'dizzy']
    };
    
    const messageLower = message.toLowerCase();
    const foundSymptoms = [];
    
    for (const [symptom, keywords] of Object.entries(symptomMap)) {
        for (const keyword of keywords) {
            if (messageLower.includes(keyword)) {
                foundSymptoms.push(symptom.charAt(0).toUpperCase() + symptom.slice(1));
                break;
            }
        }
    }
    
    return [...new Set(foundSymptoms)];
};

// Query Neo4j for matching diseases
const findMatchingDiseases = async (symptoms) => {
    const driver = getNeo4jDriver();
    if (!driver) return [];
    
    const session = driver.session({ database: 'sehatlink' });
    try {
        if (symptoms.length === 0) return [];
        
        const result = await session.run(`
            MATCH (s:Symptom)-[r:INDICATES]->(d:Disease)
            WHERE toLower(s.name) IN $symptoms
            RETURN d.name as disease, 
                   COUNT(s) as matchCount,
                   COLLECT(s.name) as matchingSymptoms
            ORDER BY matchCount DESC
            LIMIT 10
        `, { symptoms: symptoms.map(s => s.toLowerCase()) });
        
        return result.records.map(record => ({
            disease: record.get('disease'),
            matchCount: record.get('matchCount'),
            matchingSymptoms: record.get('matchingSymptoms')
        }));
        
    } catch (error) {
        console.error('Neo4j query error:', error);
        return [];
    } finally {
        await session.close();
    }
};

// Main send message function
const sendMessage = async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const userId = req.user?.id || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        
        console.log(`\n=== User ${userId}: ${message.substring(0, 50)}`);
        
        // Step 1: Extract symptoms from message
        const symptoms = extractSymptoms(message);
        console.log('Extracted symptoms:', symptoms);
        
        // Step 2: Query Neo4j for matching diseases
        const matchingDiseases = await findMatchingDiseases(symptoms);
        console.log('Matching diseases from Neo4j:', matchingDiseases.length);
        
        // Step 3: Let the service generate response (handles Neo4j data + AI)
        const response = await sehatlinkModel.generateResponse(message, symptoms, matchingDiseases);
        
        // Step 4: Store in MongoDB
        const collection = getChatbotCollection();
        let conversation;
        
        if (conversationId) {
            conversation = await collection.findOne({ conversationId, userId });
        }
        
        if (!conversation) {
            const newConversationId = uuidv4();
            await collection.insertOne({
                conversationId: newConversationId,
                userId: userId,
                title: message.substring(0, 50),
                messages: [],
                summary: { symptoms: [], possibleDiseases: [] },
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            conversation = await collection.findOne({ conversationId: newConversationId });
        }
        
        await collection.updateOne(
            { conversationId: conversation.conversationId },
            {
                $push: {
                    messages: {
                        $each: [
                            {
                                role: 'user',
                                content: message,
                                symptoms: symptoms,
                                timestamp: new Date()
                            },
                            {
                                role: 'assistant',
                                content: response,
                                possibleDiseases: matchingDiseases,
                                timestamp: new Date()
                            }
                        ]
                    }
                },
                $set: { updatedAt: new Date() },
                $addToSet: {
                    'summary.symptoms': { $each: symptoms },
                    'summary.possibleDiseases': { $each: matchingDiseases.map(d => d.disease) }
                }
            }
        );
        
        res.json({
            success: true,
            response: response,
            conversationId: conversation.conversationId,
            matchingDiseases: matchingDiseases,
            symptoms: symptoms
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all conversations
const getConversations = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;
        const collection = getChatbotCollection();
        
        const conversations = await collection.find({ userId, status: 'active' })
            .sort({ updatedAt: -1 })
            .toArray();
        
        const formattedConversations = conversations.map(c => ({
            conversationId: c.conversationId,
            title: c.title,
            messageCount: c.messages?.length || 0,
            lastUpdated: c.updatedAt,
            summary: c.summary || { symptoms: [], possibleDiseases: [] }
        }));
        
        res.json({ success: true, conversations: formattedConversations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single conversation
const getConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?.id || req.query.userId;
        const collection = getChatbotCollection();
        
        const conversation = await collection.findOne({ conversationId, userId });
        
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }
        
        res.json({ success: true, conversation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete conversation
const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?.id || req.body.userId;
        const collection = getChatbotCollection();
        
        await collection.updateOne(
            { conversationId, userId },
            { $set: { status: 'deleted', updatedAt: new Date() } }
        );
        
        res.json({ success: true, message: 'Conversation deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// New conversation
const newConversation = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const newConversationId = uuidv4();
        const collection = getChatbotCollection();
        
        await collection.insertOne({
            conversationId: newConversationId,
            userId: userId,
            title: 'New Conversation',
            messages: [],
            summary: { symptoms: [], possibleDiseases: [] },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        res.json({
            success: true,
            conversationId: newConversationId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Test Neo4j
const testNeo4j = async (req, res) => {
    const driver = getNeo4jDriver();
    if (!driver) {
        return res.json({ success: false, message: 'Neo4j not connected' });
    }
    
    const session = driver.session({ database: 'sehatlink' });
    try {
        const diseaseResult = await session.run('MATCH (d:Disease) RETURN COUNT(d) as count');
        const symptomResult = await session.run('MATCH (s:Symptom) RETURN COUNT(s) as count');
        
        res.json({
            success: true,
            neo4jConnected: true,
            stats: {
                diseases: diseaseResult.records[0].get('count'),
                symptoms: symptomResult.records[0].get('count')
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    } finally {
        await session.close();
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getConversation,
    deleteConversation,
    newConversation,
    testNeo4j
};