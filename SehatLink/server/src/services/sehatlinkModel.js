const axios = require('axios');

class SehatlinkMedicalModel {
    constructor() {
        this.modelName = 'sehatlink-fast';
        this.isReady = false;
        this.apiUrl = 'http://localhost:11434/api/generate';
        this.externalAPIKey = '';
    }

    async initialize() {
        try {
            const response = await axios.post(this.apiUrl, {
                model: this.modelName,
                prompt: 'test',
                stream: false,
                options: { num_predict: 1 }
            }, { timeout: 5000 });

            if (response.data) {
                this.isReady = true;
                console.log(`✅ ${this.modelName} is ready (local API)`);
                return true;
            }
        } catch (error) {
            console.log(`⚠️ Local Ollama API not responding`);
        }
        return this.isReady;
    }

    generateNeo4jResponse(symptoms, matchingDiseases) {
        if (symptoms.length === 0) return null;

        if (matchingDiseases.length === 0) {
            return `**📋 Symptoms detected:** ${symptoms.join(', ')}

I couldn't find specific matching conditions in our medical database for these symptoms.

**Recommended actions:**
1. 📝 Monitor your symptoms
2. 💧 Stay hydrated and rest
3. 🏥 Consult a doctor if symptoms persist

⚠️ I'm an AI assistant, not a doctor. This information is for educational purposes only.`;
        }
        let response = `**📋 Based on your symptoms (${symptoms.join(', ')}):**\n\n`;
        response += `**🔍 Possible conditions from our medical database:**\n`;
        matchingDiseases.slice(0, 5).forEach((disease, index) => {
            response += `${index + 1}. **${disease.disease}**\n`;
        });
        response += `\n**💡 What you can do:**\n`;
        response += `• Rest and stay hydrated\n`;
        response += `• Monitor your symptoms\n`;
        response += `• Consult a doctor if symptoms persist or worsen\n\n`;
        response += `⚠️ **I'm an AI assistant, not a doctor.** This information is for educational purposes only.\n`;
        return response;
    }

    // ============ LAYER 1: Local Ollama API ============
    async callLocalAPI(question, timeoutMs = 120000) {
        try {
            console.log('🤖 [LAYER 1] Calling local Ollama API...');
            const startTime = Date.now();
            const response = await axios.post(this.apiUrl, {
                model: this.modelName,
                prompt: question,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 250
                }
            }, {
                timeout: timeoutMs,
                headers: { 'Content-Type': 'application/json' }
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Local API responded in ${duration}s`);

            if (response.data && response.data.response) {
                return response.data.response;
            }
            return null;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.log(`⏰ Local API timeout after ${timeoutMs / 1000}s`);
            } else {
                console.log('⚠️ Local API error:', error.message);
            }
            return null;
        }
    }

    // ============ LAYER 2: External API (Groq) - FALLBACK ============
    async callExternalAPI(question) {
        if (!this.externalAPIKey) {
            console.log('⚠️ External API not configured');
            return null;
        }

        try {
            console.log('🌐 [LAYER 2] Falling back to External API (Groq)...');
            const startTime = Date.now();

            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are SehatLink Medical AI. Provide helpful medical information. Always say you are not a doctor. Keep responses concise (under 100 words).'
                        },
                        { role: 'user', content: question }
                    ],
                    temperature: 0.7,
                    max_tokens: 250
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.externalAPIKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ External API responded in ${duration}s`);
            return response.data.choices[0].message.content;
        } catch (error) {
            console.log('❌ External API failed:', error.response?.data?.error?.message || error.message);
            return null;
        }
    }

    async generateResponse(userMessage, symptoms, matchingDiseases) {
        console.log('\n🎯 Processing:', userMessage.substring(0, 500));
        console.log('📊 Neo4j matched diseases:', matchingDiseases.length);
        // Emergency detection - immediate
        const msgLower = userMessage.toLowerCase();
        if (msgLower.includes('chest pain') || msgLower.includes('heart attack')) {
            return "⚠️ **URGENT:** Chest pain requires immediate medical attention. Call emergency services now.";
        }
        if (msgLower.includes('difficulty breathing') || msgLower.includes("can't breathe")) {
            return "⚠️ **URGENT:** Difficulty breathing is serious. Seek immediate medical attention.";
        }
        // LAYER 1: Use Neo4j data (instant, no AI)
        const neo4jResponse = this.generateNeo4jResponse(symptoms, matchingDiseases);
        if (neo4jResponse) {
            console.log('📊 Using Neo4j data response (instant)');
            return neo4jResponse;
        }
        // LAYER 2: Try local Ollama API
        console.log('🤖 No Neo4j data, trying local Ollama API...');
        let response = await this.callLocalAPI(userMessage, 120000);

        // LAYER 3: If local fails, use external API as fallback
        if (!response) {
            console.log('🔄 Local API failed, switching to external API');
            response = await this.callExternalAPI(userMessage);
        }
        if (!response) {
            response = "I'm here to help with health questions. Please describe your symptoms or ask about a medical condition.\n\n⚠️ I'm an AI assistant, not a doctor.";
        }

        return response;
    }

    async generateDirectResponse(prompt) {
        let response = await this.callLocalAPI(prompt, 120000);
        if (!response) {
            response = await this.callExternalAPI(prompt);
        }
        if (!response) {
            response = "I'm having trouble responding. Please consult a doctor for medical advice.\n\n⚠️ I'm an AI assistant, not a doctor.";
        }
        return response;
    }

    getInfo() {
        return {
            name: this.modelName,
            status: this.isReady ? 'Ready (Local API)' : 'Limited',
            apiUrl: 'http://localhost:11434 (Local)',
            externalAPIFallback: !!this.externalAPIKey,
            strategy: 'Neo4j → Local API → External API'
        };
    }
}

module.exports = new SehatlinkMedicalModel();