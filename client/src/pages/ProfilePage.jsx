/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/navbar/Navbar";
import NotificationBell from "../components/NotificationBell";
import {
  Linkedin,
  Github,
  Twitter,
  Edit,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Plus,
  Sparkles, // AI Icon
  X, // Close icon
  Check, // Save icon
  Search, // Search icon
  MessageSquare, // Sessions icon
  User, // User icon
  Loader, // Loader icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { setNotifications } from "../redux/slices/notificationSlice";
import Footer from "../components/footer/Footer";
import defaultAvatar from "../assets/avatar.jpeg";

/**
 * A utility component to add our animated gradient styles.
 */
const AnimatedGradientStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      .animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 15s ease infinite; }
      .session-list::-webkit-scrollbar { width: 8px; }
      .session-list::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      .session-list::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.6); border-radius: 10px; }
      .session-list::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 1); }
    `}
  </style>
);

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};
const cardHoverEffect = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

const ProfilePage = () => {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [modalTeach, setModalTeach] = useState("");
  const [modalLearn, setModalLearn] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingSessions, setPendingSessions] = useState([]);
  const [acceptedSessions, setAcceptedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // --- NEW AI MATCHMAKING STATE ---
  const [aiMatch, setAiMatch] = useState(null);
  const [isAiMatchLoading, setIsAiMatchLoading] = useState(false);
  
  const dispatch = useDispatch();

  // --- LOGIC (UNCHANGED) ---
  const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const { data } = await axios.get("http://localhost:5000/api/users/profile", { headers: { "x-auth-token": token } });
        setUser(data);
        setSkillsToTeach(data.skillsToTeach || []);
        setSkillsToLearn(data.skillsToLearn || []);
        setStatusInput(data.status || "");
        
        const notifRes = await axios.get(`http://localhost:5000/api/notifications/${data._id}`, { headers: { "x-auth-token": token } });
        dispatch(setNotifications(notifRes.data));
      } catch { setError("Failed to load profile."); }
    };
    fetchUserProfile();
  }, [dispatch]);

  useEffect(() => {
    const fetchSessions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const [p, a, co] = await Promise.all([
          axios.get("http://localhost:5000/api/sessions/pending", { headers: { "x-auth-token": token } }),
          axios.get("http://localhost:5000/api/sessions/accepted", { headers: { "x-auth-token": token } }),
          axios.get("http://localhost:5000/api/sessions/completed", { headers: { "x-auth-token": token } }),
        ]);
        const now = new Date();
        setPendingSessions(p.data.filter((session) => new Date(session.sessionDate) >= now));
        setAcceptedSessions(a.data);
        setCompletedSessions(co.data);
      } catch { setError("Error fetching sessions"); }
    };
    fetchSessions();
  }, []);

  // --- PROFILE STRENGTH CALCULATION (Moved up to be available for hooks) ---
  let profileStrength = 20;
  const strengthChecks = {
    status: !!user?.status,
    socials: !!(user?.socials && (user.socials.linkedin || user.socials.github || user.socials.twitter)),
    teach: skillsToTeach.length > 0 && skillsToTeach[0] !== '',
    learn: skillsToLearn.length > 0 && skillsToLearn[0] !== '',
  };
  if (strengthChecks.status) profileStrength += 20;
  if (strengthChecks.socials) profileStrength += 20;
  if (strengthChecks.teach) profileStrength += 20;
  if (strengthChecks.learn) profileStrength += 20;
  
  // --- NEW: PROACTIVE AI MATCHMAKING ---
  const fetchAiMatch = async () => {
    setIsAiMatchLoading(true);
    // Mocked response:
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockMatch = {
      userId: "mock-id-123",
      name: "Alex Johnson",
      wantsToLearn: "React", // A skill you teach
      canTeach: "Python", // A skill you want to learn
    };
    setAiMatch(mockMatch);
    setIsAiMatchLoading(false);
  };

  // *** HOOK FIX: This useEffect is now moved *before* the early return ***
  useEffect(() => {
    // We check for `user` here to prevent running on initial null state
    if (user && strengthChecks.teach && strengthChecks.learn && !aiMatch && !isAiMatchLoading) {
      // Only run if skills are set and we haven't already found a match
      fetchAiMatch();
    }
  }, [user, strengthChecks.teach, strengthChecks.learn, aiMatch, isAiMatchLoading]); // Dependencies


  // --- MODAL & NAVIGATION HANDLERS ---
  const openModal = () => {
    setModalTeach(skillsToTeach.join(", "));
    setModalLearn(skillsToLearn.join(", "));
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const handleStartChat = (id) => (window.location.href = `/chat/${id}`);
  const handleEditProfile = () => (window.location.href = "/profile-settings");
  const handleSearchPage = () => (window.location.href = "/search");
  
  // --- NEW: AI MATCH PROFILE NAVIGATION ---
  const handleViewProfile = (id) => (window.location.href = `/user/${id}`); // Assumes you have a route like /user/:id

  // --- DATA UPDATE HANDLERS ---
  const handleUpdateSkills = async () => {
    const token = localStorage.getItem("token");
    const skillsToTeachArray = modalTeach.split(",").map((s) => s.trim()).filter(s => s);
    const skillsToLearnArray = modalLearn.split(",").map((s) => s.trim()).filter(s => s);
    
    try {
      const { data } = await axios.put("http://localhost:5000/api/users/profile", {
        ...user,
        skillsToTeach: skillsToTeachArray,
        skillsToLearn: skillsToLearnArray,
      }, { headers: { "x-auth-token": token } });
      
      setUser(data);
      setSkillsToTeach(data.skillsToTeach);
      setSkillsToLearn(data.skillsToLearn);
      setSuccess("Skills updated successfully!");
      closeModal();
    } catch { setError("Failed to update skills."); }
  };
  
  const handleStatusUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.put("http://localhost:5000/api/users/profile", {
        ...user,
        status: statusInput,
      }, { headers: { "x-auth-token": token } });
      
      setUser(data);
      setStatusInput(data.status);
      setSuccess("Status updated!");
      setIsEditingStatus(false);
    } catch { setError("Failed to update status."); }
  };

  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("http://localhost:5000/api/sessions/accept", { sessionId: id }, { headers: { "x-auth-token": token } });
      setPendingSessions((ps) => ps.filter((s) => s._id !== id));
      setAcceptedSessions((as) => [...as, res.data.session]);
      setSuccess("Session accepted");
    } catch { setError("Failed to accept session."); }
  };
  
  const getSessionPartnerName = (session) => {
    const partner = session.userId1?._id === user?._id ? session.userId2 : session.userId1;
    return partner?.name ?? "Unknown User";
  };
  
  // --- MODAL AI SUGGESTER ---
  const handleAiSuggest = async () => {
    if (!modalTeach) {
      setError("Please add your 'Skills to Teach' first so the AI can give good suggestions.");
      return;
    }
    setError("");
    setIsAiLoading(true);
    try {
      // --- MOCK API CALL ---
      await new Promise(resolve => setTimeout(resolve, 1500));
      const suggestions = "Next.js, TypeScript, GraphQL, Node.js, UI/UX Principles";
      setModalLearn(suggestions);
    } catch (err) {
      setError("AI Suggestion failed. Please try again.");
    }
    setIsAiLoading(false);
  };

  // AI Growth Coach Logic
  const getAiGrowthTip = () => {
    if (!strengthChecks.teach) {
      return { text: "Add skills you can teach. This is the #1 way to get matched!", cta: "Add Skills", onClick: openModal, icon: <Plus size={18} className="mr-2" /> };
    }
    if (!strengthChecks.learn) {
      return { text: "What are you curious about? Add skills to learn and find mentors.", cta: "Add Skills", onClick: openModal, icon: <Plus size={18} className="mr-2" /> };
    }
    if (pendingSessions.length > 0) {
      return { text: "You have pending session requests! Respond now to build momentum.", cta: "View Sessions", onClick: () => document.getElementById('session-hub')?.scrollIntoView({ behavior: 'smooth' }), icon: <MessageSquare size={18} className="mr-2" /> };
    }
    
    // --- NEW AI MATCH LOGIC ---
    if (isAiMatchLoading) {
      return { text: "Your AI Coach is scanning the network for your perfect match...", cta: "Scanning...", disabled: true, icon: <Loader size={18} className="mr-2 animate-spin" /> };
    }
    if (aiMatch) {
      return { text: `AI Match Found! ${aiMatch.name} wants to learn ${aiMatch.wantsToLearn} and can teach you ${aiMatch.canTeach}.`, cta: "View Profile", onClick: () => handleViewProfile(aiMatch.userId), icon: <User size={18} className="mr-2" /> };
    }
    
    // Fallback
    return { text: "Your profile is set! You're all set to find a swap.", cta: "Find Manually", onClick: handleSearchPage, icon: <Search size={18} className="mr-2" /> };
  };

  const aiTip = getAiGrowthTip();
  
  // --- LOADING STATE (This is now safe to use) ---
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full px-4 py-12 bg-gray-900 text-gray-200">
        Loading your profile...
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen relative w-full bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-x-hidden font-['Inter',_sans-serif]">
      <AnimatedGradientStyles />
      <div className="relative z-10">
        <Navbar />
        <motion.div
          className="max-w-7xl mx-auto p-4 md:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* --- NOTIFICATION BANNERS --- */}
          {success && (
            <motion.div variants={itemVariants} className="bg-green-900/50 border border-green-700 text-green-300 p-3 rounded-lg mb-6">
              {success}
            </motion.div>
          )}
          {error && (
            <motion.div variants={itemVariants} className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg mb-6">
              {error}
            </motion.div>
          )}

          {/* --- INTERACTIVE PROFILE HUB --- */}
          <motion.div
            variants={itemVariants}
            whileHover={cardHoverEffect}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8 bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-emerald-700/50 hover:shadow-emerald-500/20 transition-all duration-300"
          >
            {/* Left Side: Profile Info */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 relative">
              <div className="absolute top-0 right-0 flex items-center space-x-2">
                <NotificationBell />
              </div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-emerald-700/50 shadow-md flex-shrink-0">
                <img
                  src={user?.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${user.profilePicture}` : defaultAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center sm:text-left w-full">
                <h2 className="text-3xl font-bold text-white">{user?.name || "User"}</h2>
                {!isEditingStatus ? (
                  <div className="flex items-center justify-center sm:justify-start group" onClick={() => setIsEditingStatus(true)}>
                    <p className="text-lg text-gray-300 mt-1 italic group-hover:text-emerald-300 cursor-pointer">
                      {statusInput || "Click to set your status"}
                    </p>
                    <Edit size={16} className="ml-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 mt-2">
                    <input type="text" value={statusInput} onChange={(e) => setStatusInput(e.target.value)} className="w-full sm:w-auto bg-gray-800/50 border border-emerald-700 text-white rounded-lg px-3 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500" placeholder="What are you working on?" />
                    <button onClick={handleStatusUpdate} className="p-1.5 bg-green-600 rounded-md hover:bg-green-500"><Check size={16} /></button>
                    <button onClick={() => setIsEditingStatus(false)} className="p-1.5 bg-red-600 rounded-md hover:bg-red-500"><X size={16} /></button>
                  </div>
                )}
                <div className="flex justify-center sm:justify-start space-x-4 mt-4">
                  {user.socials?.linkedin && <a href={user.socials.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-400 transition"><Linkedin size={22} /></a>}
                  {user.socials?.github && <a href={user.socials.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-400 transition"><Github size={22} /></a>}
                  {user.socials?.twitter && <a href={user.socials.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-400 transition"><Twitter size={22} /></a>}
                </div>
              </div>
            </div>
            {/* Right Side: Profile Strength */}
            <div className="border-t border-emerald-900/50 lg:border-t-0 lg:border-l lg:pl-6 pt-6 lg:pt-0">
              <h3 className="text-2xl font-semibold text-white mb-4">Profile Strength</h3>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <motion.div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-3 rounded-full" initial={{ width: "0%" }} animate={{ width: `${profileStrength}%` }} transition={{ duration: 1, ease: "easeInOut" }}></motion.div>
              </div>
              <p className="text-lg font-semibold text-emerald-300 mb-4">{profileStrength}% Complete</p>
              <ul className="space-y-3">
                <li className={`flex items-center ${strengthChecks.status ? "text-gray-300" : "text-gray-500"}`}>
                  {strengthChecks.status ? <CheckCircle size={20} className="text-emerald-400 mr-3" /> : <Circle size={20} className="mr-3" />} Set your status
                </li>
                <li className={`flex items-center justify-between ${strengthChecks.socials ? "text-gray-300" : "text-gray-500"}`}>
                  <div className="flex items-center">{strengthChecks.socials ? <CheckCircle size={20} className="text-emerald-400 mr-3" /> : <Circle size={20} className="mr-3" />} Link social accounts</div>
                  {!strengthChecks.socials && <button onClick={handleEditProfile} className="text-emerald-500 hover:text-emerald-400"><Plus size={16} /></button>}
                </li>
                <li className={`flex items-center justify-between ${strengthChecks.teach ? "text-gray-300" : "text-gray-500"}`}>
                  <div className="flex items-center">{strengthChecks.teach ? <CheckCircle size={20} className="text-emerald-400 mr-3" /> : <Circle size={20} className="mr-3" />} Add skills to teach</div>
                  {!strengthChecks.teach && <button onClick={openModal} className="text-emerald-500 hover:text-emerald-400"><Plus size={16} /></button>}
                </li>
                <li className={`flex items-center justify-between ${strengthChecks.learn ? "text-gray-300" : "text-gray-500"}`}>
                  <div className="flex items-center">{strengthChecks.learn ? <CheckCircle size={20} className="text-emerald-400 mr-3" /> : <Circle size={20} className="mr-3" />} Add skills to learn</div>
                  {!strengthChecks.learn && <button onClick={openModal} className="text-emerald-500 hover:text-emerald-400"><Plus size={16} /></button>}
                </li>
              </ul>
            </div>
          </motion.div>

          {/* --- MAIN DATA ROW: SKILLS + SESSIONS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
            {/* --- SKILL BANK --- */}
            <motion.div
              variants={itemVariants}
              whileHover={cardHoverEffect}
              className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-emerald-700/50 h-[450px] flex flex-col hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">My Skill Bank</h2>
                <button onClick={openModal} className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-medium">
                  <Edit size={16} className="mr-2" /> Manage Skills
                </button>
              </div>
              <div className="space-y-6 overflow-y-auto session-list pr-2">
                <div>
                  <p className="text-lg font-medium text-gray-300 mb-3">Skills I Can Teach:</p>
                  <div className="flex flex-wrap gap-2">
                    {strengthChecks.teach ? (
                      skillsToTeach.map((s, i) => (<span key={i} className="bg-emerald-800/50 border border-emerald-700 text-emerald-200 text-base font-medium rounded-full px-4 py-1">{s}</span>))
                    ) : ( <span className="text-gray-500 text-sm p-2 italic">Add skills to teach...</span> )}
                  </div>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-300 mb-3">Skills I Want to Learn:</p>
                  <div className="flex flex-wrap gap-2">
                    {strengthChecks.learn ? (
                      skillsToLearn.map((s, i) => (<span key={i} className="bg-teal-800/50 border border-teal-700 text-teal-200 text-base font-medium rounded-full px-4 py-1">{s}</span>))
                    ) : ( <span className="text-gray-500 text-sm p-2 italic">Add skills to learn...</span> )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* --- SESSION HUB --- */}
            <motion.div
              id="session-hub"
              variants={itemVariants}
              whileHover={cardHoverEffect}
              className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-emerald-700/50 h-[450px] flex flex-col hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">My Session Hub</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setActiveTab("pending")} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === "pending" ? "bg-emerald-500 text-white" : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70"}`}>Pending ({pendingSessions.length})</button>
                <button onClick={() => setActiveTab("upcoming")} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === "upcoming" ? "bg-emerald-500 text-white" : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70"}`}>Upcoming ({acceptedSessions.length})</button>
                {/* --- THIS IS THE FIX --- */}
                <button onClick={() => setActiveTab("completed")} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === "completed" ? "bg-emerald-500 text-white" : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70"}`}>Completed ({completedSessions.length})</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 session-list">
                {/* *** THIS IS THE FIX: Added closing parenthesis *** */}
                {(activeTab === "pending" ? pendingSessions : activeTab === "upcoming" ? acceptedSessions : completedSessions).length > 0 ? (
                  (activeTab === "pending" ? pendingSessions : activeTab === "upcoming" ? acceptedSessions : completedSessions).map((s) => (
                    <div key={s._id} className="bg-gray-800/60 ring-1 ring-emerald-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{getSessionPartnerName(s, user._id)}</p>
                        <p className="text-sm text-emerald-300">{s.skill}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {formatDate(s.sessionDate)}</span>
                          <span className="flex items-center"><Clock size={14} className="mr-1.5" /> {formatTime(s.sessionDate)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => activeTab === "pending" ? handleAccept(s._id) : handleStartChat(s._id)}
                        className={`mt-3 sm:mt-0 text-sm font-medium px-3 py-1.5 rounded-lg transition active:scale-95 ${activeTab === "pending" ? "bg-green-500 text-white hover:bg-green-600" : "bg-teal-500 text-white hover:bg-teal-600"}`}
                      >
                        {activeTab === "pending" ? "Accept" : activeTab === "upcoming" ? "Start Chat" : "View Feedback"}
                      </button>
                    </div>
                  ))
                ) : ( <p className="text-gray-500 text-center pt-16">No {activeTab} sessions.</p> )}
              </div>
            </motion.div>
          </div>

          {/* --- WIDGET ROW: AI COACH + ACTIVITY --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* --- AI GROWTH COACH (NEW) --- */}
            <motion.div
              variants={itemVariants}
              whileHover={cardHoverEffect}
              className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-emerald-700/50 hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <Sparkles size={24} className="text-emerald-400 mr-3" />
                </motion.div>
                <h2 className="text-2xl font-semibold text-white">AI Growth Coach</h2>
              </div>
              <p className="text-lg text-gray-300 mb-5 min-h-[56px]">{aiTip.text}</p>
              <button
                onClick={aiTip.onClick}
                disabled={aiTip.disabled}
                className="w-full flex items-center justify-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-base font-medium disabled:opacity-50 disabled:cursor-wait"
              >
                {aiTip.icon}
                {aiTip.cta}
              </button>
            </motion.div>

            {/* --- ACTIVITY HUB --- */}
            <motion.div
              variants={itemVariants}
              whileHover={cardHoverEffect}
              className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-emerald-700/50 hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-white mb-4">Activity at a Glance</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-500/20 rounded-lg mr-4"><CheckCircle className="text-emerald-400" size={24} /></div>
                  <div>
                    <p className="text-3xl font-bold text-white">{completedSessions.length}</p>
                    <p className="text-sm text-gray-300">Sessions Completed</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-sky-500/20 rounded-lg mr-4"><Calendar className="text-sky-400" size={24} /></div>
                  <div>
                    <p className="text-3xl font-bold text-white">{acceptedSessions.length}</p>
                    <p className="text-sm text-gray-300">Sessions Upcoming</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-amber-500/20 rounded-lg mr-4"><Clock className="text-amber-400" size={24} /></div>
                  <div>
                    <p className="text-3xl font-bold text-white">{pendingSessions.length}</p>
                    <p className="text-sm text-gray-300">Sessions Pending</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </motion.div>

        {/* --- EDIT MODAL (with AI) --- */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="bg-gray-900/80 backdrop-blur-xl border border-emerald-700/50 rounded-lg shadow-xl p-6 w-full max-w-lg"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Tune Your Skill Profile</h2>
                {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Skills You Can Teach</label>
                  <input type="text" value={modalTeach} onChange={(e) => setModalTeach(e.target.value)} className="w-full border border-gray-600 rounded-lg p-3 text-base bg-gray-800/50 text-white placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. JavaScript, Python, UI Design" />
                  <p className="text-xs text-gray-400 mt-1">Separate skills with a comma.</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-300">Skills You Want to Learn</label>
                    <button
                      onClick={handleAiSuggest}
                      disabled={isAiLoading}
                      className="flex items-center text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-wait"
                    >
                      <Sparkles size={16} className={`mr-1.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                      {isAiLoading ? 'Suggesting...' : 'AI Suggest'}
                    </button>
                  </div>
                  <input type="text" value={modalLearn} onChange={(e) => setModalLearn(e.target.value)} className="w-full border border-gray-600 rounded-lg p-3 text-base bg-gray-800/50 text-white placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. React, Data Science, Figma" />
                  <p className="text-xs text-gray-400 mt-1">Separate skills with a comma.</p>
                </div>

                <div className="flex justify-end space-x-4">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition text-base">
                    Cancel
                  </button>
                  <button onClick={handleUpdateSkills} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-base">
                    Save My Skills
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  );
};

export default ProfilePage;