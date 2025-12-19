// skill-swap/backend/controllers/matchmakingController.js
const User = require('../models/User'); 

exports.proactiveMatch = async (req, res) => {
    const currentUserId = req.user.id; 

    try {
        const currentUser = await User.findById(currentUserId).select('skillsToTeach skillsToLearn');
        if (!currentUser) return res.status(200).json({});

        const { skillsToTeach, skillsToLearn } = currentUser;

        // 1. Find ALL other real users (excluding self)
        const allUsers = await User.find({ 
            _id: { $ne: currentUserId },
            $or: [
                { skillsToTeach: { $in: skillsToLearn } },
                { skillsToLearn: { $in: skillsToTeach } }
            ]
        }).select('name skillsToTeach skillsToLearn profilePicture');

        if (allUsers.length === 0) {
            return res.json({}); // No real users match any skills
        }

        // 2. Pick the best real user based on overlap
        let bestMatch = null;
        let highestScore = -1;

        allUsers.forEach(partner => {
            const teachOverlap = partner.skillsToTeach.filter(s => skillsToLearn.includes(s)).length;
            const learnOverlap = partner.skillsToLearn.filter(s => skillsToTeach.includes(s)).length;
            const score = teachOverlap + learnOverlap;

            if (score > highestScore) {
                highestScore = score;
                bestMatch = {
                    userId: partner._id,
                    name: partner.name,
                    profilePicture: partner.profilePicture,
                    canTeach: partner.skillsToTeach.find(s => skillsToLearn.includes(s)) || partner.skillsToTeach[0],
                    wantsToLearn: partner.skillsToLearn.find(s => skillsToTeach.includes(s)) || partner.skillsToLearn[0]
                };
            }
        });

        return res.json(bestMatch);

    } catch (err) {
        console.error("Matchmaking Error:", err.message);
        res.status(500).send('Server Error');
    }
};