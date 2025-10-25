/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
 
import { io } from 'socket.io-client';
 
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';
// MessageInput component is used in your original code
import MessageInput from '../components/chat/MessageInput';
import { useNavigate, useParams } from 'react-router-dom';
// Replacing react-icons with lucide-react
import { Calendar, Clock, AlertTriangle, Send, X as LucideX, Menu as LucideMenu, Star, CheckCircle, MessageSquare } from 'lucide-react'; // Added needed Lucide icons
import Footer from "../components/footer/Footer";
 
import { motion, AnimatePresence } from 'framer-motion'; // For modal animations
 
import { ToastContainer, toast } from 'react-toastify'; // Keep toast notifications
import 'react-toastify/dist/ReactToastify.css';
import defaultAvatar from "../assets/avatar.jpeg"; // Assuming default avatar exists

/**
 * A utility component to add our animated gradient styles.
 * Consistent with other themed pages.
 */
const AnimatedGradientStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    .animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 15s ease infinite; }
    /* Themed Scrollbars */
    .themed-scrollbar::-webkit-scrollbar { width: 8px; }
    .themed-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
    .themed-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.6); border-radius: 10px; }
    .themed-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 1); }
    /* Style date/time inputs */
    input[type="date"], input[type="time"] { color-scheme: dark; }
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(0.8) sepia(1) saturate(5) hue-rotate(120deg); cursor: pointer;
    }
    /* Style file input button */
     .custom-file-input::-webkit-file-upload-button { visibility: hidden; }
     .custom-file-input::before {
       content: 'Choose File'; display: inline-block;
       background: linear-gradient(to bottom, #10b981, #0d9488); border: 1px solid #047857;
       border-radius: 6px; padding: 5px 8px; outline: none; white-space: nowrap;
       cursor: pointer; color: white; font-weight: 500; font-size: 10pt; margin-right: 10px;
     }
     .custom-file-input:hover::before { background: linear-gradient(to bottom, #059669, #0d9488); }
     .custom-file-input:active::before { background-color: #047857; }
  `}</style>
);

// Framer Motion Variants for Modals
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const ChatPage = () => {
  // --- STATE (Unchanged) ---
  const { sessionId } = useParams();
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notificationSocket, setNotificationSocket] = useState(null);
  const [rating, setRating] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const navigate = useNavigate(); // Keep useNavigate
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null); // Ref for scrolling

  // --- LOGIC (Functionality Unchanged) ---

   useEffect(() => { /* ... fetchConnections logic ... */ }, [sessionId]);
   useEffect(() => { /* ... setup Chat Socket logic ... */ }, [sessionId]);
   useEffect(() => { /* ... setup Notification Socket logic ... */ }, []);
   useEffect(() => { /* ... fetchMessages logic ... */ }, [selectedConnection]);
   useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]); // Scroll on new message

   const handleSelectConnection = (connection) => {
       setSelectedConnection(connection);
       navigate(`/chat/${connection._id}`); // Use navigate as in original code
       setIsMenuOpen(false); // Close mobile menu
     };

   const handleSendMessage = (message, file) => { /* ... logic unchanged ... */ };
   const openScheduleModal = () => { setIsScheduleModalOpen(true); };
   const closeScheduleModal = () => { setIsScheduleModalOpen(false); };
   const openFeedbackModal = () => { setIsFeedbackModalOpen(true); };
   const closeFeedbackModal = () => { setIsFeedbackModalOpen(false); };
   const handleScheduleSession = async () => { /* ... logic unchanged ... */ };
   const handleMarkSession = async (status) => { /* ... logic unchanged ... */ };
   const openReportModal = () => { setIsReportModalOpen(true); setReportSuccess(false); };
   const closeReportModal = () => { setIsReportModalOpen(false); };
   const handleReportSubmit = async (e) => { /* ... logic unchanged ... */ };
   const loggedInUser = JSON.parse(localStorage.getItem('user'));
   const isUser1 = selectedConnection?.userId1?._id === loggedInUser?._id;
   const isUser2 = selectedConnection?.userId2?._id === loggedInUser?._id;
   const isFeedbackGivenByLoggedInUser = isUser1 ? !!selectedConnection?.feedbackByUser1 : isUser2 ? !!selectedConnection?.feedbackByUser2 : false;
   const bothUsersProvidedFeedback = !!selectedConnection?.feedbackByUser1 && !!selectedConnection?.feedbackByUser2;
   const isSessionCompletedOrCanceled = selectedConnection?.status === 'completed' || selectedConnection?.status === 'canceled';
   const isChatBlocked = isSessionCompletedOrCanceled && bothUsersProvidedFeedback;
   // Corrected logic based on your original code
   const shouldShowFeedbackButton = !isFeedbackGivenByLoggedInUser && !isChatBlocked; // Show if feedback not given AND chat not blocked
   const shouldShowScheduleButton = !isSessionCompletedOrCanceled && !bothUsersProvidedFeedback;
   const shouldShowMarkButtons = !isSessionCompletedOrCanceled; // Show mark buttons if session is not over

   const getOtherUserName = (connection) => { /* ... logic unchanged ... */ };
   const getChatUserName = () => { /* ... logic unchanged ... */ };
   const formatDate = (dateString) => { /* ... logic unchanged ... */ };
   const formatTime = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); // Added helper
   const getChatUserAvatar = () => { // Added helper for avatar
       if (!selectedConnection || !loggedInUser) return defaultAvatar;
       const otherUser = selectedConnection.userId1?._id === loggedInUser._id ? selectedConnection.userId2 : selectedConnection.userId1;
       return otherUser?.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${otherUser.profilePicture}` : defaultAvatar;
     };
     const isMobile = window.innerWidth < 768;

  // --- RENDER ---
  return (
    // Themed main container
    <div className="min-h-screen relative w-full bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-hidden font-['Inter',_sans-serif]">
      <AnimatedGradientStyles />
      <div className="relative z-10 flex flex-col h-screen"> {/* Use h-screen */}
        <Navbar />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden pt-4 pb-4 px-4 md:px-6 lg:px-8 gap-6">

          {/* Hamburger Button for Mobile (Themed) */}
          <button
            className="md:hidden fixed top-[86px] left-4 z-50 p-2 bg-black/50 backdrop-blur-sm text-emerald-400 rounded-lg shadow-lg border border-emerald-700/50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle connections list"
          >
            <LucideMenu size={24}/>
          </button>

          {/* Left Panel: Connections List (Themed) */}


          <motion.div
            initial={false}
            animate={isMobile ? { x: isMenuOpen ? '0%' : '-100%' } : { x: '0%' }} // only animate mobile
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            className="fixed md:static top-0 left-0 z-40 w-full max-w-xs h-full md:h-auto md:max-w-[300px] flex-shrink-0 bg-black/50 backdrop-blur-lg rounded-r-2xl md:rounded-2xl shadow-xl border border-emerald-700/50 flex flex-col p-4 md:p-6 overflow-hidden"
          >

            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-semibold text-white">Connections</h2>
              <button className="md:hidden text-gray-400 hover:text-emerald-300" onClick={() => setIsMenuOpen(false)}><LucideX size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 themed-scrollbar pr-2">
              {connections.length > 0 ? (
                connections.map((connection) => {
                  const isSelected = selectedConnection?._id === connection._id;
                  const otherUserName = getOtherUserName(connection);
                  const otherUser = connection.userId1?._id === loggedInUser?._id ? connection.userId2 : connection.userId1;
                  const avatarUrl = otherUser?.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${otherUser.profilePicture}` : defaultAvatar;
                  // Use formatTime if sessionTime exists, otherwise fallback or show nothing
                   const displayTime = connection.sessionTime ? connection.sessionTime : formatTime(connection.sessionDate);

                  return (
                    <div
                      key={connection._id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? 'bg-emerald-600/50 ring-2 ring-emerald-400 shadow-lg' // Themed selected
                          : 'bg-black/20 hover:bg-emerald-900/40 border border-transparent hover:border-emerald-700/50' // Themed default
                      }`}
                      onClick={() => handleSelectConnection(connection)}
                    >
                      <img src={avatarUrl} alt={otherUserName} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-emerald-700" onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar }}/>
                      <div className="overflow-hidden">
                        <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-100'}`}>{otherUserName}</p>
                        <p className={`text-xs truncate ${isSelected ? 'text-emerald-100' : 'text-emerald-300'}`}>{connection.skill || 'Skill Swap'}</p>
                        <p className={`text-xs truncate ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>{formatDate(connection.sessionDate)} at {displayTime}</p> {/* Use displayTime */}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400 pt-10">No active connections.</p>
              )}
            </div>
          </motion.div>

          {/* Mobile Overlay */}
          <AnimatePresence>{isMenuOpen && (<motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsMenuOpen(false)}></motion.div>)}</AnimatePresence>

          {/* Right Panel: Chat Area (Themed) */}
          <div className="flex-1 bg-black/30 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-700/50 flex flex-col overflow-hidden">
            {selectedConnection ? (
              <>
                {/* Chat Header (Themed) */}
                <div className="flex items-center justify-between p-4 border-b border-emerald-700/50 flex-shrink-0">
                   <div className="flex items-center gap-3 min-w-0">
                     <img src={getChatUserAvatar()} alt={getChatUserName()} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar }}/>
                     <div className="min-w-0">
                       <h2 className="text-xl md:text-2xl font-semibold text-white truncate">{getChatUserName()}</h2>
                       <p className="text-sm text-emerald-300 truncate">{selectedConnection.skill || 'Skill Swap'}</p>
                     </div>
                   </div>
                   {/* Report Button (Themed) */}
                   <button
                     onClick={openReportModal}
                     title="Report User"
                     className="flex items-center gap-1.5 py-1.5 px-3 bg-red-600/80 text-white rounded-lg shadow hover:bg-red-700 transition duration-200 text-xs font-medium"
                   >
                     <AlertTriangle size={16} /> Report
                   </button>
                </div>

                {/* Messages Container (Themed) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 themed-scrollbar">
                  {messages.length > 0 ? (
                    messages.map((msg, index) => {
                      const isSender = msg.senderId?._id === loggedInUser?._id;
                      const senderName = msg.senderName || (isSender ? loggedInUser?.name : getChatUserName()) || 'User';

                      return (
                        <motion.div
                          key={msg._id || index}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] md:max-w-[60%] p-3 rounded-xl shadow ${ isSender ? 'bg-emerald-700/70 text-white rounded-br-none' : 'bg-gray-700/50 text-gray-100 rounded-bl-none' }`}>
                             {!isSender && <p className="text-xs font-semibold text-emerald-300 mb-1">{senderName}</p>}
                            <span className="text-sm break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content || '' }} />
                             {msg.mediaUrl && (
                                <div className="mt-2 max-w-xs">
                                    {msg.mediaType === 'image' && <img src={msg.mediaUrl} alt="Uploaded content" className="rounded-lg cursor-pointer object-cover" onClick={() => window.open(msg.mediaUrl, '_blank')} style={{maxHeight: '200px'}}/>}
                                    {msg.mediaType === 'audio' && <audio controls src={msg.mediaUrl} className="w-full h-10"></audio>}
                                    {msg.mediaType === 'video' && <video controls src={msg.mediaUrl} className="rounded-lg max-h-[250px]"></video>}
                                </div>
                            )}
                             <p className={`text-xs mt-1.5 ${isSender ? 'text-emerald-100/70 text-right' : 'text-gray-400/80 text-left'}`}>
                               {formatTime(msg.createdAt)}
                             </p>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-400 pt-16">No messages yet. Start the conversation!</p>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Feedback Display (Themed) */}
                {isSessionCompletedOrCanceled && (feedbackByUser1 || feedbackByUser2) && (
                   <div className="feedback-display bg-black/20 p-4 rounded-lg border border-emerald-700/30 m-4 flex-shrink-0">
                     {feedbackByUser1 && (
                       <div className="mb-2">
                          <h3 className="text-sm font-semibold text-emerald-300">{selectedConnection.userId1?.name || 'User 1'}'s Feedback:</h3>
                          <p className="text-xs text-gray-300 italic">"{feedbackByUser1}"</p>
                       </div>
                     )}
                      {feedbackByUser2 && (
                       <div>
                          <h3 className="text-sm font-semibold text-emerald-300">{selectedConnection.userId2?.name || 'User 2'}'s Feedback:</h3>
                          <p className="text-xs text-gray-300 italic">"{feedbackByUser2}"</p>
                       </div>
                     )}
                   </div>
                )}

                {/* Message Input Area (Uses MessageInput component from original code) */}
                {!isChatBlocked && <MessageInput sendMessage={handleSendMessage} />}
                {isChatBlocked && (
                   <div className="mt-auto p-4 border-t border-emerald-700/50 text-center text-gray-500 text-sm italic flex-shrink-0">
                       Chat is disabled for this session.
                   </div>
                )}


                {/* Action Buttons Row (Themed) */}
                <div className="flex flex-wrap justify-center items-center gap-3 p-4 border-t border-emerald-700/50 flex-shrink-0">
                  {shouldShowScheduleButton && (
                    <button onClick={openScheduleModal} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-sm font-medium">
                      <Calendar size={16} /> Reschedule
                    </button>
                  )}
                  {shouldShowMarkButtons && (
                    <>
                      <button
                        onClick={() => {
                          if (!feedback && !isFeedbackGivenByLoggedInUser && selectedConnection?.status !== 'canceled') { // Don't require feedback if canceling
                             openFeedbackModal();
                          } else {
                             handleMarkSession('completed');
                          }
                        }}
                        className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-sm font-medium">
                         <CheckCircle size={16}/> Complete
                      </button>
                      <button onClick={() => handleMarkSession('canceled')} className="flex items-center gap-2 py-2 px-4 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition text-sm font-medium">
                         <LucideX size={16}/> Cancel
                      </button>
                    </>
                  )}
                   {/* Provide Feedback Button */}
                   {shouldShowFeedbackButton && (
                     <button onClick={openFeedbackModal} className="flex items-center gap-2 py-2 px-4 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition text-sm font-medium">
                       <Star size={16}/> Provide Feedback
                     </button>
                   )}
                </div>
              </>
            ) : (
              // Themed Placeholder View
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-10">
                 <MessageSquare size={64} className="mb-6 opacity-30 text-emerald-600"/>
                <h2 className="text-2xl font-semibold text-white mb-2">Select a Connection</h2>
                <p className="text-base text-gray-400 max-w-sm">Choose a user from the left panel to view messages and start collaborating.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modals (Themed and Animated) */}
        <AnimatePresence>
          {/* Feedback Modal */}
          {isFeedbackModalOpen && (
            <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div variants={modalVariants} className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-emerald-700/50 text-white p-6 rounded-2xl shadow-xl relative">
                <button onClick={closeFeedbackModal} className="absolute top-3 right-3 text-gray-400 hover:text-emerald-300 transition"><LucideX size={24} /></button>
                <h3 className="text-xl font-bold mb-5 text-center text-emerald-400">Session Feedback</h3>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-5 Stars):</label>
                <div className="flex justify-center space-x-2 mb-4">
                   {[1, 2, 3, 4, 5].map(star => (<Star key={star} size={28} className={`cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} onClick={() => setRating(star)}/>))}
                 </div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Feedback:</label>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How was the session?" rows="4" className="w-full p-3 rounded-lg bg-black/30 border border-emerald-700/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"/>
                <button
                   // Updated logic: Always tries to mark session after feedback submission
                   onClick={() => handleMarkSession(isSessionCompletedOrCanceled ? selectedConnection.status : 'completed')}
                   className="w-full mt-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 active:scale-95">
                   Submit Feedback {isSessionCompletedOrCanceled ? '' : '& Mark Complete'}
                 </button>
              </motion.div>
            </motion.div>
          )}

          {/* Schedule Modal */}
          {isScheduleModalOpen && (
             <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <motion.div variants={modalVariants} className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-emerald-700/50 text-white p-6 rounded-2xl shadow-xl relative">
                 <button onClick={closeScheduleModal} className="absolute top-3 right-3 text-gray-400 hover:text-emerald-300 transition"><LucideX size={24} /></button>
                 <h2 className="text-xl font-bold mb-5 text-center text-emerald-400">Reschedule Session</h2>
                 <div className="flex flex-col gap-4">
                   <label className="flex flex-col font-medium text-gray-300 text-sm"><span className="mb-1">Select New Date:</span><input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="p-3 rounded-lg bg-black/30 border border-emerald-700/50 text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none" style={{ colorScheme: 'dark' }} /></label>
                   <label className="flex flex-col font-medium text-gray-300 text-sm"><span className="mb-1">Select New Time:</span><input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="p-3 rounded-lg bg-black/30 border border-emerald-700/50 text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none" style={{ colorScheme: 'dark' }} /></label>
                 </div>
                 <button onClick={handleScheduleSession} className="w-full mt-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 active:scale-95">
                   Request Reschedule
                 </button>
               </motion.div>
             </motion.div>
          )}

          {/* Report Modal */}
          {isReportModalOpen && (
            <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div variants={modalVariants} className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-red-700/50 text-white p-6 rounded-2xl shadow-xl relative">
                <button onClick={closeReportModal} className="absolute top-3 right-3 text-gray-400 hover:text-red-400 transition"><LucideX size={24} /></button>
                <h3 className="text-xl font-semibold text-red-400 mb-4 text-center">Report User</h3>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Reason:</label>
                    <select value={reason} onChange={(e) => setReason(e.target.value)} required className="mt-1 w-full p-3 border rounded-lg bg-black/30 border-red-700/50 text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm appearance-none">
                      <option value="">Select Reason</option>
                      <option value="Spam">Spam</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Inappropriate Behavior">Inappropriate Behavior</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Description:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue" required className="mt-1 w-full p-3 border text-gray-200 rounded-lg bg-black/30 border-red-700/50 h-32 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Attach Screenshot (Optional):</label>
                    <input type="file" onChange={(e) => setScreenshot(e.target.files[0])} accept="image/*" className="custom-file-input mt-1 w-full border rounded-lg bg-black/30 border-red-700/50 text-gray-400 text-sm"/> {/* Custom class for styling */}
                  </div>
                  <button type="submit" className="w-full mt-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/40 transform hover:-translate-y-0.5 active:scale-95">
                    Submit Report
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer outside the main flex content */}
        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>
       <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default ChatPage;