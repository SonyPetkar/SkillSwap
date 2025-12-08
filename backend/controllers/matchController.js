// controllers/matchController.js

const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Corrected import for SDK v0.4.0+
const mongoose = require('mongoose');

// 1. Initialize AI Client and Helper Function
// Ensure GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

// Helper function to call the AI for a suggestion when DB search fails
const getAiSuggestedMatch = async (teachSkills, learnSkills) => {
    // Define the desired output structure (JSON Schema) - Gemini API doesn't directly use this in the SDK
    // but the prompt implicitly guides the output
    const prompt = `
        You are an expert SkillSwap Matchmaking AI for the SkillSwap platform.
        The current user teaches these skills: ${teachSkills.join(', ')}.
        The current user wants to learn these skills: ${learnSkills.join(', ')}.
        
        Your task is to generate a single, highly relevant, and reciprocal match suggestion for the user.
        The generated partner must want to learn ONE skill the user teaches AND must be able to teach ONE skill the user wants to learn.
        Provide the response strictly in JSON format with the following keys:
        - "userId": a mock ID like 'ai-suggestion-1'
        - "name": a realistic mock name for the partner
        - "wantsToLearn": a skill from the user's teachSkills list that the mock partner should want
        - "canTeach": a skill from the user's learnSkills list that the mock partner can teach
        - "score": a high score (e.g., 100) to indicate a strong AI match
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use genAI
        const result = await model.generateContent(prompt); // Pass prompt directly
        const response = await result.response; // Get the raw response object
        const jsonText = response.text().trim(); // Extract text and trim

        const aiMatch = JSON.parse(jsonText);
        
        // Add a unique, non-MongoDB ID for the frontend to handle the 'View Match' click
        aiMatch.userId = `ai-suggestion-${new mongoose.Types.ObjectId()}`; 
        aiMatch.isAiGenerated = true; 
        
        return aiMatch;

    } catch (e) {
        console.error("AI Match Generation Failed (API or JSON error):", e); // Log the full error object for debugging
        return null;
    }
};

const matchSkills = (skillsToTeach, skillsToLearn) => {
  const matches = [];

  if (!skillsToTeach || !skillsToLearn) return matches;

  const normalizedTeachSkills = skillsToTeach
    .map(skill => skill.trim().toLowerCase());
  const normalizedLearnSkills = skillsToLearn
    .map(skill => skill.trim().toLowerCase());

  normalizedLearnSkills.forEach((learnSkill) => {
    normalizedTeachSkills.forEach((teachSkill) => {
      if (teachSkill === learnSkill) {
        matches.push({ teachSkill, learnSkill });
      }
    });
  });

  return matches;
};

const getSkillMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ msg: 'Current user not found' });
    }

    const users = await User.find({ _id: { $ne: req.user.id }, 'skillsToTeach.0': { $exists: true } });

    const matches = users.flatMap((user) => {
      const matchedSkills = matchSkills(currentUser.skillsToLearn, user.skillsToTeach);
      if (matchedSkills.length > 0) {
        return matchedSkills.map((skill) => ({
          user: user,
          teachSkill: skill.teachSkill,
          learnSkill: skill.learnSkill,
        }));
      }
      return [];
    });

    res.json(matches);
  } catch (err) {
    console.error('Error fetching matches:', err.message);
    res.status(500).send('Server error');
  }
};


const proactiveMatch = async (req, res) => {
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

        const potentialPartners = await User.find({
            _id: { $ne: currentUserId },
            skillsToLearn: { $in: teachSkills }, 
            skillsToTeach: { $in: learnSkills }
        }).select('name skillsToTeach skillsToLearn').limit(10); 

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

        if (bestMatch && bestMatch.score > 0) {
            console.log("DB Match found. Returning reciprocal match.");
            return res.json(bestMatch);
        } else {
            console.log("DB Match failed. Calling AI for suggestion...");
            
            const aiSuggestion = await getAiSuggestedMatch(teachSkills, learnSkills);

            if (aiSuggestion) {
                console.log("AI Match generated successfully.");
                return res.json(aiSuggestion);
            } else {
                console.log("AI Match also failed. Returning empty object.");
                return res.json({}); 
            }
        }

    } catch (err) {
        console.error("Matchmaking Error:", err); // Log the full error object
        res.status(500).send('Server Error in Matchmaking');
    }
};

// ----------------------------------------------------
// THIS IS THE NEW FUNCTION YOU NEED
// ----------------------------------------------------
const sendSwapRequest = async (req, res) => {
    try {
        // req.user.id comes from the verifyToken middleware
        const senderUserId = req.user.id; 
        const { receiverUserId, skillOffered, skillRequested } = req.body;

        // Basic validation
        if (!receiverUserId || !skillOffered || !skillRequested) {
            return res.status(400).json({ msg: 'Missing required fields for swap request.' });
        }

        // TODO: Implement actual logic for creating and saving the swap request.
        // This typically involves creating a new document in a 'SwapRequest' or 'Session' collection.
        // Example:
        // const newSwapRequest = new SwapRequest({
        //     sender: senderUserId,
        //     receiver: receiverUserId,
        //     skillOffered: skillOffered,
        //     skillRequested: skillRequested,
        //     status: 'pending' // Or 'requested', etc.
        // });
        // await newSwapRequest.save();

        console.log(`[SWAP REQUEST] From User ID: ${senderUserId} to User ID: ${receiverUserId}: Offering "${skillOffered}", Requesting "${skillRequested}"`);

        // You might want to notify the receiver via socket.io here.
        // This often requires passing the 'io' instance to controllers or a dedicated notification service.

        res.status(200).json({
            message: 'Swap request received and processed (logic to be implemented).',
            requestDetails: { senderUserId, receiverUserId, skillOffered, skillRequested }
        });

    } catch (error) {
        console.error('Error sending swap request:', error);
        res.status(500).json({ message: 'Failed to send swap request due to a server error.' });
    }
};


// ----------------------------------------------------
// EXPORT ALL REQUIRED FUNCTIONS HERE
// ----------------------------------------------------
module.exports = {
    getSkillMatches,
    proactiveMatch,
    sendSwapRequest // <<<--- ENSURE THIS IS EXPORTED
};
