// skill-swap/backend/controllers/matchmakingController.js

const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User'); 
const mongoose = require('mongoose'); // Needed for new ObjectId

// 1. Initialize AI Client and Helper Function
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

// Helper function to call the AI for a suggestion when DB search fails
const getAiSuggestedMatch = async (teachSkills, learnSkills) => {
    // Define the desired output structure (JSON Schema)
    const responseSchema = {
        type: "object",
        properties: {
            // Use a mock ID for frontend consumption
            userId: { type: "string", description: "A mock ID like 'ai-suggestion-1'" },
            name: { type: "string", description: "A realistic mock name for the partner" },
            wantsToLearn: { type: "string", description: "A skill from the user's teachSkills list that the mock partner should want." },
            canTeach: { type: "string", description: "A skill from the user's learnSkills list that the mock partner can teach." },
            score: { type: "integer", description: "A high score (e.g., 100) to indicate a strong AI match." }
        },
        required: ["userId", "name", "wantsToLearn", "canTeach", "score"]
    };

    const prompt = `
        You are an expert SkillSwap Matchmaking AI for the SkillSwap platform.
        The current user teaches these skills: ${teachSkills.join(', ')}.
        The current user wants to learn these skills: ${learnSkills.join(', ')}.
        
        Your task is to generate a single, highly relevant, and reciprocal match suggestion for the user.
        The generated partner must want to learn ONE skill the user teaches AND must be able to teach ONE skill the user wants to learn.
        Provide the response strictly in the requested JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const aiMatch = JSON.parse(jsonText);
        
        // Add a unique, non-MongoDB ID for the frontend to handle the 'View Match' click
        aiMatch.userId = `ai-suggestion-${new mongoose.Types.ObjectId()}`; 
        aiMatch.isAiGenerated = true; 
        
        return aiMatch;

    } catch (e) {
        console.error("AI Match Generation Failed (API or JSON error):", e.message); 
        return null;
    }
};

exports.proactiveMatch = async (req, res) => {
    const currentUserId = req.user.id; 

    try {
        const currentUser = await User.findById(currentUserId).select('skillsToTeach skillsToLearn');
        if (!currentUser) {
            return res.status(200).json({});
        }

        const teachSkills = currentUser.skillsToTeach;
        const learnSkills = currentUser.skillsToLearn;

        if (teachSkills.length === 0 || learnSkills.length === 0) {
            return res.json({}); 
        }

        // 2. Database Search (RELAXED QUERY IS RECOMMENDED, but using your current strict one for now)
        const potentialPartners = await User.find({
            _id: { $ne: currentUserId },
            skillsToLearn: { $in: teachSkills }, 
            skillsToTeach: { $in: learnSkills }
        }).select('name skillsToTeach skillsToLearn').limit(10); 

        // 3. Find the best match
        let bestMatch = null;
        let maxScore = -1;

        for (const partner of potentialPartners) {
            const mutualTeach = partner.skillsToLearn.filter(skill => teachSkills.includes(skill));
            const mutualLearn = partner.skillsToTeach.filter(skill => learnSkills.includes(skill));
            
            const score = mutualTeach.length + mutualLearn.length;

            if (score > maxScore) {
                maxScore = score;
                bestMatch = {
                    userId: partner._id,
                    name: partner.name,
                    wantsToLearn: mutualTeach[0] || 'A skill you teach', 
                    canTeach: mutualLearn[0] || 'A skill you learn',    
                    score: score
                };
            }
        }

        // 4. Hybrid Match Logic
        if (bestMatch && bestMatch.score > 0) {
            // Return DB match if found
            console.log("DB Match found. Returning reciprocal match.");
            return res.json(bestMatch);
        } else {
            // Fallback to AI if no perfect DB match exists
            console.log("DB Match failed. Calling AI for suggestion...");
            
            const aiSuggestion = await getAiSuggestedMatch(teachSkills, learnSkills);

            if (aiSuggestion) {
                console.log("AI Match generated successfully.");
                return res.json(aiSuggestion); // RETURN AI MATCH
            } else {
                console.log("AI Match also failed. Returning empty object.");
                return res.json({}); 
            }
        }

    } catch (err) {
        console.error("Matchmaking Error:", err.message);
        res.status(500).send('Server Error in Matchmaking');
    }
};