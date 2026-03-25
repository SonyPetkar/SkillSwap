/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/navbar/Navbar";
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
  Sparkles,
  X,
  Check,
  Search,
  MessageSquare,
  User,
  Loader,
  Brain,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { setNotifications } from "../redux/slices/notificationSlice";
import Footer from "../components/footer/Footer";
import defaultAvatar from "../assets/avatar.jpeg";
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const AnimatedGradientStyles = () => (
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
.animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 15s ease infinite; }
.session-list::-webkit-scrollbar { width: 8px; }
.session-list::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
.session-list::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.6); border-radius: 10px; }
.session-list::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 1); }
`}</style>
);

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

const SkillLevelIndicator = ({ teachSkills, learnSkills }) => {
const totalSkills = teachSkills.length + learnSkills.length;
let level = 'Novice';
let color = 'text-gray-500';

if (totalSkills >= 1) { level = 'Explorer'; color = 'text-yellow-400'; }
if (totalSkills >= 5) { level = 'Collaborator'; color = 'text-cyan-400'; }
if (totalSkills >= 10) { level = 'Master Swapper'; color = 'text-emerald-400'; }

return (
<div className="p-4 bg-black/30 rounded-lg border border-teal-500/50 shadow-lg mt-6 text-center">
<TrendingUp size={24} className={`mx-auto mb-2 ${color}`} />
<h4 className="text-lg font-bold text-white">Current Swap Rank:</h4>
<p className={`text-2xl font-extrabold ${color} transition-colors duration-300`}>{level}</p>
<p className="text-sm text-gray-400 mt-1">Total skills tracked: {totalSkills}</p>
</div>
);
};

const AiMatchCard = ({ match, handleViewProfile, handleSendRequest, fetchAiMatch }) => {
    if (!match) return null;
    const avatarUrl = match.profilePicture 
        ? `http://localhost:5000/uploads/profile-pictures/${match.profilePicture}` 
        : defaultAvatar;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-emerald-900/40 border border-emerald-700 rounded-xl p-4 flex flex-col items-center text-center shadow-lg"
        >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 mb-3">
                <img src={avatarUrl} alt={match.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar }} />
            </div>
            <p className="text-xl font-bold text-white mb-2">{match.name}</p>
            <div className="w-full text-left space-y-2 mb-4 text-sm">
                <p className="text-gray-300"><span className="font-semibold text-teal-300">Wants to Learn:</span> **{match.wantsToLearn || 'N/A'}**</p>
                <p className="text-gray-300"><span className="font-semibold text-emerald-300">Can Teach You:</span> **{match.canTeach || 'N/A'}**</p>
            </div>
            <div className="flex w-full space-x-2 mb-3">
                <button onClick={() => handleViewProfile(match.userId)} className="w-1/2 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium active:scale-95"><User size={16} className="mr-2" /> View Profile</button>
                <button onClick={() => handleSendRequest(match.userId, match.canTeach, match.wantsToLearn)} className="w-1/2 flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium active:scale-95"><Plus size={16} className="mr-2" /> Swap Request</button>
            </div>
            <button onClick={() => fetchAiMatch(true)} className="w-full flex items-center justify-center py-1 text-sm text-gray-400 hover:text-white transition rounded-lg bg-black/20 hover:bg-black/40 border border-transparent hover:border-emerald-700/50"><Search size={16} className="mr-1.5" /> Find Next Member</button>
        </motion.div>
    );
}

const ProfilePage = () => {
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
const [aiMatch, setAiMatch] = useState(null); 
const [isAiMatchLoading, setIsAiMatchLoading] = useState(false);
const [viewedUser, setViewedUser] = useState(null);
const [isViewModalOpen, setIsViewModalOpen] = useState(false);

const dispatch = useDispatch();
const formatDate = (iso) => new Date(iso).toLocaleDateString();
const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

useEffect(() => {
    const fetchUserProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const userRes = await axios.get("http://localhost:5000/api/users/profile", { headers: { "x-auth-token": token } });
            setUser(userRes.data);
            setSkillsToTeach(userRes.data.skillsToTeach || []);
            setSkillsToLearn(userRes.data.skillsToLearn || []);
            setStatusInput(userRes.data.status || "");
            const notifRes = await axios.get(`http://localhost:5000/api/notifications/${userRes.data._id}`, { headers: { "x-auth-token": token } });
            if (Array.isArray(notifRes.data)) { dispatch(setNotifications(notifRes.data)); }
        } catch { setError("Failed to load profile."); }
    };
    fetchUserProfile();
}, [dispatch]);

useEffect(() => {
    if (!user?._id) return;
    const token = localStorage.getItem("token");
    const newSocket = io('http://localhost:5000/notifications', { query: { userId: user._id }, withCredentials: true });
    newSocket.on('new_notification', (notification) => {
        toast.info(notification.message);
        axios.get(`http://localhost:5000/api/notifications/${user._id}`, { headers: { "x-auth-token": token } })
        .then(res => { if (Array.isArray(res.data)) dispatch(setNotifications(res.data)); });
    });
    newSocket.on('newMeetingScheduled', (data) => { toast.success(data.message); fetchSessions(); });
    return () => newSocket.disconnect();
}, [user?._id, dispatch]); 

const fetchSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const [p, a, co] = await Promise.all([
            axios.get("http://localhost:5000/api/sessions/pending", { headers: { "x-auth-token": token } }),
            axios.get("http://localhost:5000/api/sessions/accepted", { headers: { "x-auth-token": token } }),
            axios.get("http://localhost:5000/api/sessions/completed", { headers: { "x-auth-token": token } }),
        ]);
        setPendingSessions(p.data);
        setAcceptedSessions(a.data);
        setCompletedSessions(co.data);
    } catch { setError("Error fetching sessions"); }
};

useEffect(() => { if (user) fetchSessions(); }, [user]);

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

const fetchAiMatch = async (forceScan = false) => {
    if (!user?._id || (aiMatch !== null && !forceScan)) return;
    setIsAiMatchLoading(true);
    const token = localStorage.getItem("token");
    try {
        const { data } = await axios.get(`http://localhost:5000/api/matchmaking/proactive-match`, { headers: { "x-auth-token": token } });
        if (data?.userId) setAiMatch(data);
        else setAiMatch('no-match-found');
    } catch { setAiMatch('error'); }
    finally { setIsAiMatchLoading(false); }
};

useEffect(() => {
    if (user && strengthChecks.teach && strengthChecks.learn && aiMatch === null) fetchAiMatch();
}, [user, strengthChecks.teach, strengthChecks.learn, aiMatch]);

const handleMarkAsDone = async (id) => {
    const token = localStorage.getItem("token");
    try {
        await axios.post("http://localhost:5000/api/sessions/mark-session", { 
            sessionId: id, status: 'completed', rating: 5, feedback: "Verified" 
        }, { headers: { "x-auth-token": token } });

        setAcceptedSessions(prev => prev.filter(s => s._id !== id));
        toast.success("Session completed!");
        setActiveTab("completed");
        await fetchSessions();
        
    } catch (err) {
        toast.error("Failed to mark done.");
        fetchSessions();
    }
};

const handleSendRequest = async (receiverId, skillToTeach, skillToLearn) => {
    const token = localStorage.getItem("token");
    if (!token) return; 

    const swapPayload = {
        userId2: receiverId,
        skill: skillToTeach,
        sessionDate: new Date(),
        sessionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
        await axios.post("http://localhost:5000/api/sessions/request", swapPayload, {
            headers: { "x-auth-token": token },
        });
        toast.success(`Swap request sent!`);
        setAiMatch(null); 
        setIsViewModalOpen(false);
        fetchSessions(); 
    } catch (err) { setError("Failed to send request."); }
};

const handleAccept = async (id) => {
    const token = localStorage.getItem("token");
    try {
        await axios.post("http://localhost:5000/api/sessions/accept", { sessionId: id }, { headers: { "x-auth-token": token } });
        setPendingSessions(ps => ps.filter(s => s._id !== id));
        fetchSessions();
        toast.success("Accepted!");
        setActiveTab("upcoming");
    } catch { toast.error("Failed."); }
};

const handleUpdateSkills = async () => {
    const token = localStorage.getItem("token");
    
    if (!modalTeach.trim() || !modalLearn.trim()) {
        toast.error("Skills cannot be empty! Please provide both teaching and learning skills.");
        return;
    }

    try {
        const { data } = await axios.put("http://localhost:5000/api/users/profile", { 
            ...user, 
            skillsToTeach: modalTeach.split(",").map(s => s.trim()).filter(s => s), 
            skillsToLearn: modalLearn.split(",").map(s => s.trim()).filter(s => s) 
        }, { headers: { "x-auth-token": token } });
        
        setUser(data); 
        setSkillsToTeach(data.skillsToTeach); 
        setSkillsToLearn(data.skillsToLearn); 
        setIsModalOpen(false); 
        toast.success("Updated!");
    } catch { setError("Failed update."); }
};

const handleStatusUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
        const { data } = await axios.put("http://localhost:5000/api/users/profile", { ...user, status: statusInput }, { headers: { "x-auth-token": token } });
        setUser(data); setIsEditingStatus(false); toast.success("Status set!");
    } catch { setError("Status failed."); }
};

const handleViewProfile = async (id) => { 
    const token = localStorage.getItem("token");
    try {
        const { data } = await axios.get(`http://localhost:5000/api/users/profile/${id}`, { headers: { "x-auth-token": token } });
        setViewedUser(data);
        setIsViewModalOpen(true);
    } catch {
        toast.error("Failed to fetch profile details.");
    }
};

const openModal = () => { setModalTeach(skillsToTeach.join(", ")); setModalLearn(skillsToLearn.join(", ")); setIsModalOpen(true); };
const closeModal = () => setIsModalOpen(false);
const handleStartChat = (id) => (window.location.href = `/chat/${id}`);
const handleEditProfile = () => (window.location.href = "/profile-settings");
const handleSearchPage = () => (window.location.href = "/search");

const handleAiSuggest = async () => {
    if (!modalTeach) { setError("Add teaching skills first."); return; }
    setIsAiLoading(true);
    try { await new Promise(r => setTimeout(r, 1500)); setModalLearn("React, Node, MongoDB"); } finally { setIsAiLoading(false); }
};

const getAiGrowthTip = () => {
    if (isAiMatchLoading) return { type: 'loading', text: "Finding platform matches...", icon: <Loader className="animate-spin mr-2"/> };
    if (aiMatch && typeof aiMatch === 'object' && aiMatch.userId) return { type: 'match', matchData: aiMatch };
    if (!strengthChecks.teach) return { type: 'tip', text: "Add skills you can teach.", cta: "Add Skills", onClick: openModal, icon: <Edit size={18} className="mr-2"/> };
    return { type: 'tip', text: "Explore the network for your next swap!", cta: "Browse Swaps", onClick: handleSearchPage, icon: <Search size={18} className="mr-2"/> };
};

const aiTip = getAiGrowthTip();

if (!user) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><Loader className="animate-spin mr-2"/> Loading...</div>;

return (
<div className="min-h-screen relative w-full bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift font-['Inter']">
<AnimatedGradientStyles />
<Navbar />
<motion.div className="max-w-7xl mx-auto p-4 md:p-8" variants={containerVariants} initial="hidden" animate="visible">
    {success && <div className="bg-green-900/50 border border-green-700 p-3 rounded-lg mb-6 text-green-300">{success}</div>}
    {error && <div className="bg-red-900/50 border border-red-700 p-3 rounded-lg mb-6 text-red-300">{error}</div>}

    <motion.div variants={itemVariants} whileHover={cardHoverEffect} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-700/50 shadow-2xl">
        <div className="lg:col-span-2 flex items-center space-x-6 relative">
            <div className="absolute top-0 right-0 flex space-x-2"><button onClick={handleEditProfile} className="bg-emerald-500 p-2 rounded-full hover:bg-emerald-600 transition"><Edit size={16} /></button></div>
            <img src={user.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${user.profilePicture}` : defaultAvatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-emerald-500 object-cover" />
            <div>
                <h2 className="text-3xl font-bold">{user.name}</h2>
                {!isEditingStatus ? <p onClick={()=>setIsEditingStatus(true)} className="italic text-gray-400 cursor-pointer">{user.status || "Set status"}</p> : <div className="flex items-center space-x-2"><input value={statusInput} onChange={e=>setStatusInput(e.target.value)} className="bg-gray-800 rounded p-1 text-sm outline-none"/><button onClick={handleStatusUpdate} className="bg-green-600 p-1 rounded"><Check size={14}/></button></div>}
            </div>
        </div>
        <div className="border-l border-emerald-700/30 pl-6">
            <h3 className="font-bold mb-2 uppercase text-xs text-emerald-500">Profile Strength</h3>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{width:`${profileStrength}%`}}/></div>
            <p className="text-[10px] mt-2 text-gray-400">{profileStrength}% Complete</p>
        </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div variants={itemVariants} className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-700/50 h-[450px] flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Skill Bank</h2>
            <div className="space-y-6 overflow-y-auto session-list flex-1 pr-2">
                <div><p className="text-[10px] text-gray-500 mb-2 uppercase font-black tracking-widest">Teaching</p><div className="flex flex-wrap gap-2">{skillsToTeach.map((s,i) => <span key={i} className="bg-emerald-900/40 border border-emerald-700 px-3 py-1 rounded-full text-xs">{s}</span>)}</div></div>
                <div><p className="text-[10px] text-gray-500 mb-2 uppercase font-black tracking-widest">Learning</p><div className="flex flex-wrap gap-2">{skillsToLearn.map((s,i) => <span key={i} className="bg-teal-900/40 border border-teal-700 px-3 py-1 rounded-full text-xs">{s}</span>)}</div></div>
            </div>
            <SkillLevelIndicator teachSkills={skillsToTeach} learnSkills={skillsToLearn} />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-700/50 h-[450px] flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Sessions</h2>
            <div className="flex space-x-2 mb-4">
                {['pending', 'upcoming', 'completed'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${activeTab === tab ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'}`}>{tab}</button>)}
            </div>
            <div className="overflow-y-auto session-list space-y-3 flex-1 pr-2">
                {(activeTab === "pending" ? pendingSessions.filter(s => s.status === "pending") : activeTab === "upcoming" ? acceptedSessions.filter(s => s.status === "accepted") : completedSessions.filter(s => s.status === "completed")).map((s) => (
                    <div key={s._id} className="bg-gray-800/40 p-4 rounded-xl flex justify-between items-center border border-emerald-700/20">
                        <div><p className="font-bold text-white text-sm">{s.skill}</p><p className="text-[10px] text-emerald-400 uppercase tracking-widest">{formatDate(s.sessionDate)}</p></div>
                        <div className="flex space-x-2">
                            {activeTab === "pending" && <button onClick={() => handleAccept(s._id)} className="bg-green-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">Accept</button>}
                            {activeTab === "upcoming" && <><button onClick={() => handleStartChat(s._id)} className="bg-teal-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">Chat</button><button onClick={() => handleMarkAsDone(s._id)} className="bg-gray-700 hover:bg-emerald-600 transition px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center"><Check size={12} className="mr-1"/> Mark Done</button></>}
                            {activeTab === "completed" && <span className="text-emerald-500 flex items-center text-[10px] font-black uppercase"><CheckCircle size={12} className="mr-1"/> Verified</span>}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald-700/50">
            <div className="flex items-center mb-6"><Sparkles className="text-emerald-400 mr-2" /> <h2 className="text-xl font-bold text-white">Growth Coach</h2></div>
            <AnimatePresence mode="wait">
                {aiTip.type === 'match' ? <AiMatchCard match={aiTip.matchData} handleViewProfile={handleViewProfile} handleSendRequest={handleSendRequest} fetchAiMatch={fetchAiMatch} /> : <div className="text-gray-300 text-sm italic py-4 text-center border border-dashed border-gray-700 rounded-xl">{aiTip.text} {aiTip.cta && <button onClick={aiTip.onClick} className="text-emerald-500 underline ml-1">{aiTip.cta}</button>}</div>}
            </AnimatePresence>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-black/30 rounded-2xl p-6 border border-emerald-700/50 flex flex-col justify-center text-center">
            <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-tighter">Activity</h2>
            <div className="grid grid-cols-3 gap-4 px-4">
                <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20"><p className="text-2xl font-black text-emerald-400">{completedSessions.length}</p><p className="text-[10px] text-gray-500 uppercase font-bold">Done</p></div>
                <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20"><p className="text-2xl font-black text-blue-400">{acceptedSessions.length}</p><p className="text-[10px] text-gray-500 uppercase font-bold">Live</p></div>
                <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-500/20"><p className="text-2xl font-black text-amber-400">{pendingSessions.length}</p><p className="text-[10px] text-gray-500 uppercase font-bold">Wait</p></div>
            </div>
        </motion.div>
    </div>
</motion.div>

<AnimatePresence>
{isModalOpen && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="bg-gray-900 border border-emerald-700/50 p-8 rounded-3xl w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Update Profile</h2>
            <div className="space-y-4">
                <input value={modalTeach} onChange={e=>setModalTeach(e.target.value)} placeholder="Skills I can teach..." className="w-full bg-black/40 border border-gray-700 p-4 rounded-2xl text-white outline-none focus:border-emerald-500" />
                <input value={modalLearn} onChange={e=>setModalLearn(e.target.value)} placeholder="Skills I want to learn..." className="w-full bg-black/40 border border-gray-700 p-4 rounded-2xl text-white outline-none focus:border-emerald-500" />
            </div>
            <div className="flex justify-end space-x-4 mt-8">
                <button onClick={()=>setIsModalOpen(false)} className="text-gray-500 font-bold hover:text-gray-300 transition">Cancel</button>
                <button onClick={handleUpdateSkills} className="bg-emerald-500 px-8 py-3 rounded-2xl font-black text-xs uppercase">Save</button>
            </div>
        </motion.div>
    </div>
)}
</AnimatePresence>

<AnimatePresence>
{isViewModalOpen && viewedUser && (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
        <motion.div initial={{y: 50, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 50, opacity: 0}} className="bg-gray-900 border border-emerald-500/30 p-8 rounded-3xl w-full max-w-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] relative">
            <button onClick={()=>setIsViewModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition"><X size={24}/></button>
            <div className="flex flex-col items-center mb-8">
                <img src={viewedUser.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${viewedUser.profilePicture}` : defaultAvatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-emerald-500 mb-4 object-cover" />
                <h2 className="text-3xl font-bold text-white">{viewedUser.name}</h2>
                <p className="text-emerald-400 italic text-sm mt-1">{viewedUser.status || "No status set"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black/40 p-5 rounded-2xl border border-emerald-900/30">
                    <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mb-3">Can Teach You</p>
                    <div className="flex flex-wrap gap-2">
                        {viewedUser.skillsToTeach?.map((s,i)=><span key={i} className="bg-emerald-900/30 text-emerald-300 border border-emerald-700/50 px-3 py-1 rounded-full text-xs">{s}</span>)}
                    </div>
                </div>
                <div className="bg-black/40 p-5 rounded-2xl border border-teal-900/30">
                    <p className="text-[10px] text-teal-500 uppercase font-black tracking-widest mb-3">Wants to Learn</p>
                    <div className="flex flex-wrap gap-2">
                        {viewedUser.skillsToLearn?.map((s,i)=><span key={i} className="bg-teal-900/30 text-teal-300 border border-teal-700/50 px-3 py-1 rounded-full text-xs">{s}</span>)}
                    </div>
                </div>
            </div>
            <div className="flex flex-col space-y-3">
                <button onClick={() => handleSendRequest(viewedUser._id, viewedUser.skillsToTeach[0], viewedUser.skillsToLearn[0])} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center">
                    <Plus size={18} className="mr-2"/> Send Swap Invitation
                </button>
            </div>
        </motion.div>
    </div>
)}
</AnimatePresence>

<Footer /><ToastContainer theme="dark" position="bottom-right" />
</div>
);
};

export default ProfilePage;