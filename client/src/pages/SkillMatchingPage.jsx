/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';
import { Search, Send, Star, User, Sparkles, Loader, BrainCircuit } from 'lucide-react'; // Added icons
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "../components/footer/Footer";
import defaultAvatar from "../assets/avatar.jpeg";
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence

/**
 * A utility component to add our animated gradient styles.
 */
const AnimatedGradientStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    .animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 15s ease infinite; }
    .suggestion-card { /* Add specific styles if needed */ }
  `}</style>
);

// Framer Motion variants
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };
const cardHoverEffect = { scale: 1.03, boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)", transition: { type: "spring", stiffness: 400, damping: 10 } };

// New variant for AI suggestion cards
const suggestionItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 12 } },
};

const SkillMatchingPage = () => {
  const [matches, setMatches] = useState([]);
  const [ratings, setRatings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionDetails, setSessionDetails] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [currentUserSkills, setCurrentUserSkills] = useState({ teach: [], learn: [] });

  // --- NEW AI SUGGESTION STATE ---
  const [aiTeachingSuggestions, setAiTeachingSuggestions] = useState([]);
  const [aiLearningSuggestions, setAiLearningSuggestions] = useState([]);
  const [isAiSuggestionsLoading, setIsAiSuggestionsLoading] = useState(true); // Start loading initially

  // Fetch user profile to get skills for AI suggestions
  useEffect(() => {
    const fetchUserSkills = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const { data } = await axios.get("http://localhost:5000/api/users/profile", { headers: { "x-auth-token": token } });
        setCurrentUserSkills({
          teach: data.skillsToTeach || [],
          learn: data.skillsToLearn || []
        });
      } catch (err) {
        console.error("Failed to load user skills for AI:", err);
      }
    };
    fetchUserSkills();
  }, []);

  // Fetch AI Suggestions (depends on user skills being loaded)
  useEffect(() => {
    const fetchAiSuggestions = async () => {
      // Don't fetch if user skills aren't loaded yet or are empty
      if (!currentUserSkills.teach.length && !currentUserSkills.learn.length) {
          setIsAiSuggestionsLoading(false); // Stop loading if no skills to suggest based on
          return;
      }

      setIsAiSuggestionsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAiSuggestionsLoading(false);
        return;
      }

      try {
        // --- THIS IS THE NEW BACKEND CALL YOU NEED TO BUILD ---
        // const response = await axios.post('http://localhost:5000/api/ai/suggest-profiles',
        //   { teach: currentUserSkills.teach, learn: currentUserSkills.learn },
        //   { headers: { 'x-auth-token': token } }
        // );
        // setAiTeachingSuggestions(response.data.suggestionsForTeaching || []);
        // setAiLearningSuggestions(response.data.suggestionsForLearning || []);
        // --- END NEW BACKEND CALL ---

        // --- MOCK RESPONSE (Remove when backend is ready) ---
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        setAiTeachingSuggestions([
          { _id: 'teach1', name: 'Bob Smith', profilePicture: null, wantsToLearn: 'React' },
          { _id: 'teach2', name: 'Charlie Day', profilePicture: null, wantsToLearn: 'Node.js' },
        ]);
        setAiLearningSuggestions([
          { _id: 'learn1', name: 'Diana Prince', profilePicture: null, canTeach: 'Python' },
          { _id: 'learn2', name: 'Eve Adams', profilePicture: null, canTeach: 'Data Analysis' },
          { _id: 'learn3', name: 'Frank Miller', profilePicture: null, canTeach: 'SQL' },
        ]);
        // --- END MOCK RESPONSE ---

      } catch (err) {
        console.error('Error fetching AI suggestions:', err);
        // Don't show a blocking error, maybe a subtle message or just skip suggestions
      } finally {
        setIsAiSuggestionsLoading(false);
      }
    };

    // Only fetch suggestions if we have the user's skills
    if (currentUserSkills.teach.length > 0 || currentUserSkills.learn.length > 0) {
        fetchAiSuggestions();
    } else {
        // If useEffect runs but skills are empty (e.g., initial load before profile fetch completes), ensure loading stops
        setIsAiSuggestionsLoading(false);
    }
  }, [currentUserSkills]); // Re-fetch if user skills change (though profile update would likely reload page)


  // Fetch regular matches (unchanged logic)
  useEffect(() => {
    const fetchMatches = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/api/matches', { headers: { 'x-auth-token': token } });
        setMatches(response.data);
        const ratingsPromises = response.data.map(async (match) => { /* ... (rating logic unchanged) ... */
          const userId = match.user._id;
          try {
             const ratingResponse = await axios.get(`http://localhost:5000/api/sessions/ratings/${userId}`, { headers: { 'x-auth-token': token } });
             const avgRating = ratingResponse.data.averageRating;
             return { userId, averageRating: typeof avgRating === 'number' ? avgRating.toFixed(1) : null };
          } catch (ratingError) { return { userId, averageRating: null }; }
        });
        const ratingsData = await Promise.all(ratingsPromises);
        setRatings(ratingsData.reduce((acc, { userId, averageRating }) => { acc[userId] = averageRating; return acc; }, {}));
      } catch (err) { console.error('Error fetching matches:', err); toast.error('Could not load matches.'); }
    };
    fetchMatches();
  }, []);

  // Handle date/time changes and send request logic (unchanged)
   const handleDateChange = (userId, value) => { /* ... (logic unchanged) ... */
     setSessionDetails((prev) => ({...prev, [userId]: { ...prev[userId], date: value }}));
     setErrorMessages((prev) => ({...prev, [userId]: { ...prev[userId], date: '' }}));
   };
   const handleTimeChange = (userId, value) => { /* ... (logic unchanged) ... */
     setSessionDetails((prev) => ({...prev, [userId]: { ...prev[userId], time: value }}));
     setErrorMessages((prev) => ({...prev, [userId]: { ...prev[userId], time: '' }}));
   };
   const sendSessionRequest = async (userId) => { /* ... (validation and request logic unchanged) ... */
     const token = localStorage.getItem('token');
     const { date, time } = sessionDetails[userId] || {};
     const skill = matches.find(match => match.user._id === userId)?.teachSkill;
     let currentErrors = {};
     if (!date) { currentErrors.date = 'Please select a date'; }
     else { const today = new Date(); today.setHours(0,0,0,0); const selectedDate = new Date(date + "T00:00:00Z"); if (selectedDate < today) { currentErrors.date = 'Date cannot be in the past'; } }
     if (!time) { currentErrors.time = 'Please select a time'; }
     else if (date && !currentErrors.date) { const now = new Date(); const selectedDateTime = new Date(`${date}T${time}:00`); if (selectedDateTime < now) { currentErrors.time = 'Time cannot be in the past'; } }
     setErrorMessages((prev) => ({ ...prev, [userId]: currentErrors }));
     if (Object.keys(currentErrors).length > 0) return;
     try {
       await axios.post('http://localhost:5000/api/sessions/request', { userId2: userId, sessionDate: date, sessionTime: time, skill }, { headers: { 'x-auth-token': token } });
       await axios.post('http://localhost:5000/api/notifications/send', { userId, message: `New session request for ${skill}`, type: 'session_request' }, { headers: { 'x-auth-token': token } });
       setSessionDetails((prev) => ({...prev, [userId]: { date: '', time: '' }}));
       toast.success('Session request sent!', { /* ... (style unchanged) ... */ icon: <Send size={20} className="text-white"/> });
     } catch (err) { console.error('Error sending session request:', err); toast.error('Error sending request.'); }
   };

  // Filter matches based on search query (unchanged)
  const filteredMatches = matches.filter((match) =>
      match.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.teachSkill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProfile = (id) => (window.location.href = `/user/${id}`);


  return (
    <div className="min-h-screen relative w-full bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-x-hidden font-['Inter',_sans-serif]">
      <AnimatedGradientStyles />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 py-10 flex-grow">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl font-bold text-center text-emerald-400 mb-4 drop-shadow-lg">
             Find Your Swap
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-center text-lg text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
             Discover peers to exchange skills with. Use the AI suggestions or search below.
          </motion.p>

          {/* --- NEW: AI SUGGESTION SECTIONS --- */}
          <AnimatePresence>
            {isAiSuggestionsLoading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex justify-center items-center gap-3 text-emerald-400 mb-10"
              >
                <Loader size={24} className="animate-spin" />
                <span>AI is finding suggestions for you...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isAiSuggestionsLoading && (aiTeachingSuggestions.length > 0 || aiLearningSuggestions.length > 0) && (
            <motion.div className="mb-12" variants={containerVariants} initial="hidden" animate="visible">
              <h2 className="text-3xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3">
                 <Sparkles className="text-emerald-400" /> AI Suggestions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Suggestions: Teach These Users */}
                {aiTeachingSuggestions.length > 0 && (
                  <motion.div variants={itemVariants}>
                     <h3 className="text-xl font-medium text-emerald-300 mb-4 text-center md:text-left">People Want to Learn From You:</h3>
                     <div className="space-y-4">
                       {aiTeachingSuggestions.slice(0, 3).map(sugg => ( // Show max 3
                         <motion.div
                           key={sugg._id}
                           variants={suggestionItemVariants}
                           whileHover={cardHoverEffect}
                           className="suggestion-card bg-black/30 backdrop-blur-lg rounded-xl p-4 border border-emerald-700/50 flex items-center justify-between gap-4 hover:shadow-emerald-500/20 transition-all"
                         >
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                             <img
                               src={sugg.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${sugg.profilePicture}` : defaultAvatar}
                               alt={sugg.name}
                               className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 flex-shrink-0"
                               onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar }}
                             />
                             <div className="min-w-0">
                               <p className="text-white font-semibold truncate">{sugg.name}</p>
                               <p className="text-sm text-gray-400 truncate">Wants to learn: <span className="text-emerald-300 font-medium">{sugg.wantsToLearn}</span></p>
                             </div>
                           </div>
                           <button
                             onClick={() => handleViewProfile(sugg._id)}
                             className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1 px-3 rounded-full transition whitespace-nowrap"
                           >
                             View Profile
                           </button>
                         </motion.div>
                       ))}
                     </div>
                  </motion.div>
                )}

                {/* Suggestions: Learn From These Users */}
                {aiLearningSuggestions.length > 0 && (
                  <motion.div variants={itemVariants}>
                     <h3 className="text-xl font-medium text-teal-300 mb-4 text-center md:text-left">People You Can Learn From:</h3>
                     <div className="space-y-4">
                       {aiLearningSuggestions.slice(0, 3).map(sugg => ( // Show max 3
                         <motion.div
                           key={sugg._id}
                           variants={suggestionItemVariants}
                           whileHover={cardHoverEffect}
                           className="suggestion-card bg-black/30 backdrop-blur-lg rounded-xl p-4 border border-teal-700/50 flex items-center justify-between gap-4 hover:shadow-teal-500/20 transition-all" // Teal border for distinction
                         >
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                             <img
                               src={sugg.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${sugg.profilePicture}` : defaultAvatar}
                               alt={sugg.name}
                               className="w-12 h-12 rounded-full object-cover border-2 border-teal-600 flex-shrink-0"
                               onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar }}
                             />
                             <div className="min-w-0">
                               <p className="text-white font-semibold truncate">{sugg.name}</p>
                               <p className="text-sm text-gray-400 truncate">Can teach you: <span className="text-teal-300 font-medium">{sugg.canTeach}</span></p>
                             </div>
                           </div>
                           <button
                             onClick={() => handleViewProfile(sugg._id)}
                             className="text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold py-1 px-3 rounded-full transition whitespace-nowrap"
                           >
                             View Profile
                           </button>
                         </motion.div>
                       ))}
                     </div>
                  </motion.div>
                )}
              </div>
              <hr className="border-t border-emerald-700/30 my-10" /> {/* Separator */}
            </motion.div>
          )}
          {/* --- END AI SUGGESTIONS --- */}


          {/* Themed Search Bar */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative max-w-lg mx-auto mb-12">
            <input type="text" placeholder="Or search manually by name or skill..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full py-3 pl-12 pr-4 rounded-xl bg-black/30 text-gray-200 placeholder-gray-400 backdrop-blur-md border border-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg transition-all duration-300" />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
          </motion.div>

          {/* Filtered User Cards with Animation */}
          <motion.div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3" variants={containerVariants} initial="hidden" animate="visible">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <motion.div
                  key={`${match.user._id}-${match.teachSkill}`}
                  variants={itemVariants}
                  whileHover={cardHoverEffect}
                  className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-700/50 p-6 flex flex-col justify-between transition-all duration-300 min-h-[300px] hover:shadow-emerald-500/20" // Themed card
                >
                  {/* User info section (Themed) */}
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <img className="w-16 h-16 rounded-full border-2 border-emerald-600 object-cover" src={match.user?.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${match.user.profilePicture}` : defaultAvatar} alt="Avatar" onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar }} />
                      <div className="flex-1 min-w-0"> {/* Added min-w-0 for truncation */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                           <h3 className="text-xl font-semibold tracking-wide text-white break-words truncate">{match.user.name}</h3>
                           {ratings[match.user._id] !== null && (
                              <div className="flex items-center text-sm text-yellow-400 font-semibold mt-1 sm:mt-0 flex-shrink-0"> {/* Prevent shrinking */}
                                 {ratings[match.user._id]}
                                 <Star size={16} className="ml-1 fill-current" />
                              </div>
                           )}
                        </div>
                        <p className="text-sm text-gray-400 italic truncate">{match.user.status || 'No status set'}</p>
                      </div>
                    </div>
                     <p className="text-base text-emerald-300 font-semibold uppercase tracking-wide mb-4 text-center border-t border-b border-emerald-900/50 py-2">
                         Can Teach: {match.teachSkill}
                     </p>
                  </div>

                  {/* Scheduling section (Themed inputs) */}
                  <div className="space-y-3 text-sm font-medium text-gray-300">
                    <label className="block text-xs uppercase tracking-wider">Schedule a Session:</label>
                    <div>
                      <input type="date" aria-label="Session Date" value={sessionDetails[match.user._id]?.date || ''} onChange={(e) => handleDateChange(match.user._id, e.target.value)} className="w-full mt-1 px-3 py-2 bg-black/20 text-gray-200 border border-emerald-700/50 rounded-lg backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition text-sm appearance-none" style={{ colorScheme: 'dark' }} />
                      {errorMessages[match.user._id]?.date && (<p className="text-red-400 text-xs mt-1">{errorMessages[match.user._id].date}</p>)}
                    </div>
                    <div>
                      <input type="time" aria-label="Session Time" value={sessionDetails[match.user._id]?.time || ''} onChange={(e) => handleTimeChange(match.user._id, e.target.value)} className="w-full mt-1 px-3 py-2 bg-black/20 text-gray-200 border border-emerald-700/50 rounded-lg backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition text-sm appearance-none" style={{ colorScheme: 'dark' }} />
                      {errorMessages[match.user._id]?.time && (<p className="text-red-400 text-xs mt-1">{errorMessages[match.user._id].time}</p>)}
                    </div>
                  </div>
                  
                  {/* Themed Button */}
                  <div className="mt-5">
                    <button onClick={() => sendSessionRequest(match.user._id)} className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 active:scale-95">
                      <Send size={18} /> Send Request
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sm:col-span-2 lg:col-span-3 text-center text-gray-400 py-16 text-lg font-medium">
                  {matches.length === 0 && !searchQuery ? "Loading matches..." : "No matches found."}
              </motion.div>
            )}
          </motion.div>
        </div>
         <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        <Footer />
      </div>
    </div>
  );
};

export default SkillMatchingPage;