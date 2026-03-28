/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';
import MessageInput from '../components/chat/MessageInput';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, AlertTriangle, X as LucideX, Menu as LucideMenu, 
  Star, CheckCircle, MessageSquare, Video, Archive, RotateCcw, Unlock, ShieldAlert
} from 'lucide-react'; 
import Footer from "../components/footer/Footer";
import { motion, AnimatePresence } from 'framer-motion'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import defaultAvatar from "../assets/avatar.jpeg"; 

const AnimatedGradientStyles = () => (
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
.animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 15s ease infinite; }
.themed-scrollbar::-webkit-scrollbar { width: 6px; }
.themed-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
.themed-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.4); border-radius: 10px; }
.themed-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.8); }
@keyframes pulse-emerald { 0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 50% { box-shadow: 0 0 20px 5px rgba(16, 185, 129, 0.2); } }
.active-glow { animation: pulse-emerald 3s infinite; }
`}</style>
);

const ChatPage = () => {
  const { sessionId } = useParams();
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null); 
  const [loggedInUser, setLoggedInUser] = useState(null); 
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setLoggedInUser(user);
  }, []); 

  const fetchConnections = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const [accepted, completed] = await Promise.all([
        axios.get('http://localhost:5000/api/sessions/accepted', { headers: { 'x-auth-token': token } }),
        axios.get('http://localhost:5000/api/sessions/completed', { headers: { 'x-auth-token': token } })
      ]);
      
      const rawChats = [...accepted.data, ...completed.data];
      const uniqueChatsMap = new Map();
      rawChats.forEach(chat => uniqueChatsMap.set(chat._id, chat));
      const deduplicatedChats = Array.from(uniqueChatsMap.values());

      setConnections(deduplicatedChats);

      if (sessionId) {
        const initialConnection = deduplicatedChats.find(conn => conn._id === sessionId);
        if (initialConnection) setSelectedConnection(initialConnection);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchConnections(); }, [sessionId, loggedInUser?._id]); 

  useEffect(() => {
    if (!loggedInUser) return;
    const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const newSocket = io(`${socketProtocol}//localhost:5000/chat`, { query: { userId: loggedInUser._id }, withCredentials: true });
    setSocket(newSocket);
    newSocket.on('connect', () => { if (sessionId) newSocket.emit('join_room', sessionId); });
    
    newSocket.on('receive_warning', () => {
      setShowWarningModal(true);
    });

    newSocket.on('account_terminated', () => {
      toast.error("Your account has been suspended due to multiple reports.");
      localStorage.clear();
      setTimeout(() => navigate('/login'), 3000);
    });

    newSocket.on('receive_message', (incomingMessage) => {
      if (selectedConnection && incomingMessage.conversationId === selectedConnection._id) {
        if (incomingMessage.senderId._id !== loggedInUser._id) { 
          setMessages(prevMessages => [...prevMessages, incomingMessage]);
        }
      }
    });
    return () => { newSocket.disconnect(); };
  }, [loggedInUser?._id, sessionId, selectedConnection]); 

  useEffect(() => {
    const fetchMessages = async () => {
      if (!loggedInUser || !selectedConnection) { setMessages([]); return; }
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5000/api/chat/${selectedConnection._id}`, { headers: { 'x-auth-token': token } });
        setMessages(response.data);
      } catch (error) { console.error(error); }
    };
    fetchMessages();
  }, [selectedConnection?._id]); 

  const handleSendMessage = async (content, file, link) => {
    if (!socket || !loggedInUser || !selectedConnection) return;
    const messageData = { senderId: loggedInUser._id, conversationId: selectedConnection._id, content: content || null };
    setMessages(prevMessages => [...prevMessages, { ...messageData, createdAt: new Date().toISOString(), senderId: { _id: loggedInUser._id } }]);
    socket.emit('send_message', messageData);
  };

  const handleArchiveSession = async () => {
    const confirmArchive = window.confirm("Archive this chat? It will be moved to your 'Completed' list.");
    if (!confirmArchive) return;
    const token = localStorage.getItem("token");
    try {
        await axios.post("http://localhost:5000/api/sessions/mark-session", { sessionId: selectedConnection._id, status: 'completed', rating: 5, feedback: "Archived" }, { headers: { "x-auth-token": token } });
        toast.success("Chat archived.");
        fetchConnections(); 
    } catch (err) { toast.error("Failed to archive."); }
  };

  const handleReopenSession = async () => {
    const confirmReopen = window.confirm("Do you want to reopen this chat?");
    if (!confirmReopen) return;
    const token = localStorage.getItem("token");
    try {
        await axios.post("http://localhost:5000/api/sessions/mark-session", { sessionId: selectedConnection._id, status: 'accepted' }, { headers: { "x-auth-token": token } });
        toast.success("Chat reopened!");
        fetchConnections(); 
    } catch (err) { toast.error("Failed to reopen."); }
  };

  const handleReportUser = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the report.");
      return;
    }
    const token = localStorage.getItem("token");
    
    const reportedId = selectedConnection.userId1?._id === loggedInUser._id 
      ? selectedConnection.userId2?._id 
      : selectedConnection.userId1?._id;
  
    const reportData = {
      reporter: loggedInUser._id,    
      targetUser: reportedId,        
      session: selectedConnection._id, 
      reason: reason,
      description: description
    };

    try {
      await axios.post("http://localhost:5000/api/reports", reportData, { 
        headers: { "x-auth-token": token } 
      });
      
      toast.warn("Report submitted. Our team will review the behavior.");
      setIsReportModalOpen(false);
      setReason('');
      setDescription('');
    } catch (err) {
      // Log the specific error message from the backend if available
      const errorMsg = err.response?.data?.message || "Failed to submit report.";
      toast.error(errorMsg);
      console.error('Report Error:', err.response?.data);
    }
  };

  const isChatBlocked = selectedConnection?.status === 'completed' || selectedConnection?.status === 'canceled';

  const getOtherUserName = (connection) => { 
    if (!connection || !loggedInUser) return 'User';
    const otherUser = connection.userId1?._id === loggedInUser._id ? connection.userId2 : connection.userId1;
    return otherUser?.name || 'Partner';
  };

  const getChatUserAvatar = () => { 
    if (!selectedConnection || !loggedInUser) return defaultAvatar;
    const otherUser = selectedConnection.userId1?._id === loggedInUser._id ? selectedConnection.userId2 : selectedConnection.userId1;
    return otherUser?.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${otherUser.profilePicture}` : defaultAvatar;
  };

  return (
    <div className="min-h-screen relative w-full bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-hidden font-['Inter',_sans-serif]">
      <AnimatedGradientStyles />
      <div className="relative z-10 flex flex-col h-screen"> 
        <Navbar />
        <div className="flex flex-1 overflow-hidden pt-4 pb-4 px-4 md:px-6 lg:px-8 gap-6">
          
          <div className="w-72 hidden md:flex flex-col bg-black/40 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-tighter">
               <MessageSquare size={18} className="text-emerald-500" /> Inbox
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 themed-scrollbar">
              {connections.map((conn) => (
                <div 
                  key={conn._id} 
                  onClick={() => navigate(`/chat/${conn._id}`)} 
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedConnection?._id === conn._id ? 'bg-emerald-600/30 border-emerald-500/50 active-glow' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <p className="font-bold text-sm">{getOtherUserName(conn)}</p>
                  <div className="flex items-center justify-between mt-1">
                     <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{conn.skill}</p>
                     {conn.status === 'completed' && <Archive size={12} className="text-gray-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-black/20 backdrop-blur-xl rounded-3xl border border-emerald-500/10 flex flex-col overflow-hidden">
            {selectedConnection ? (
              <>
                <div className="p-5 border-b border-emerald-500/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                     <img src={getChatUserAvatar()} className="w-10 h-10 rounded-full border border-emerald-500/30 object-cover" alt="avatar" />
                     <div>
                        <h2 className="text-lg font-bold text-white">{getOtherUserName(selectedConnection)}</h2>
                        <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">{selectedConnection.status}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsReportModalOpen(true)} className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"><AlertTriangle size={18}/></button>
                    <button onClick={() => window.open(`https://meet.jit.si/${selectedConnection._id}`, '_blank')} className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 rounded-xl transition-all"><Video size={18}/></button>
                    {!isChatBlocked ? (
                        <button onClick={handleArchiveSession} className="p-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"><Archive size={18}/></button>
                    ) : (
                        <button onClick={handleReopenSession} className="p-2 bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white rounded-xl transition-all"><RotateCcw size={18}/></button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 themed-scrollbar">
                  {messages.map((msg, i) => (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.senderId?._id === loggedInUser?._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-[70%] ${msg.senderId?._id === loggedInUser?._id ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-white/5'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-black/40 border-t border-emerald-500/10">
                    {!isChatBlocked ? (
                        <MessageInput sendMessage={handleSendMessage} />
                    ) : (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                           <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
                              <CheckCircle size={16} /> Chat is currently archived
                           </div>
                           <button onClick={handleReopenSession} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl transition-all">
                             <RotateCcw size={14} /> Resume Conversation
                           </button>
                        </div>
                    )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 italic gap-4">
                <MessageSquare size={48} className="text-emerald-500/20" />
                <p>Pick a connection to swap knowledge</p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 border border-red-500/30 p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <div className="flex items-center gap-3 mb-6 text-red-500">
                <ShieldAlert size={24} />
                <h2 className="text-xl font-bold uppercase tracking-tighter">Report User</h2>
              </div>
              <div className="space-y-4">
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g., Misbehavior, Spam)" className="w-full bg-black/40 border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-red-500 transition-all" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description..." rows={4} className="w-full bg-black/40 border border-gray-700 p-4 rounded-xl text-white outline-none focus:border-red-500 transition-all resize-none" />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button onClick={() => setIsReportModalOpen(false)} className="text-gray-500 font-bold hover:text-gray-300 transition-all">Cancel</button>
                <button onClick={handleReportUser} className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Submit Report</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-gray-900 border-2 border-amber-500 p-10 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-amber-500" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Official Warning</h2>
              <p className="text-gray-300 leading-relaxed mb-8">
                A report has been filed against your behavior. Please follow the platform guidelines, behave professionally, and respect the tutor and their time. Multiple reports (5+) will lead to permanent account termination.
              </p>
              <button onClick={() => setShowWarningModal(false)} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl uppercase tracking-widest transition-all">
                I Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default ChatPage;