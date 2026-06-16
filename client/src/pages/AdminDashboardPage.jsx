import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, LogOut, ArrowLeft, X, Linkedin, User, AlertTriangle, TrendingUp, Activity, ChevronRight } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import defaultAvatar from '../assets/avatar.jpeg'; 

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [matchStats, setMatchStats] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [selectedSkillForDetails, setSelectedSkillForDetails] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
      setUsers(data.users); 
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const calculateDynamicStats = (allUsers) => {
    const teachingCounts = {};
    const learningCounts = {};

    allUsers.forEach(user => {
      if (user.skillsToTeach && Array.isArray(user.skillsToTeach)) {
        user.skillsToTeach.forEach(skill => {
          teachingCounts[skill] = (teachingCounts[skill] || 0) + 1;
        });
      }
      if (user.skillsToLearn && Array.isArray(user.skillsToLearn)) {
        user.skillsToLearn.forEach(skill => {
          learningCounts[skill] = (learningCounts[skill] || 0) + 1;
        });
      }
    });

    const combinedSkills = new Set([...Object.keys(teachingCounts), ...Object.keys(learningCounts)]);
    const dynamicStats = [];

    combinedSkills.forEach(skill => {
      const teachCount = teachingCounts[skill] || 0;
      const learnCount = learningCounts[skill] || 0;
      if (teachCount > 0 || learnCount > 0) {
        dynamicStats.push({
          skill,
          teachCount,
          learnCount,
          totalCount: teachCount + learnCount,
          teachers: allUsers.filter(u => u.skillsToTeach?.includes(skill)),
          learners: allUsers.filter(u => u.skillsToLearn?.includes(skill))
        });
      }
    });

    return dynamicStats.sort((a, b) => b.totalCount - a.totalCount);
  };

  const openStatsModal = () => {
    setIsLoadingStats(true);
    const stats = calculateDynamicStats(users);
    setMatchStats(stats);
    setIsStatsModalOpen(true);
    setIsLoadingStats(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(user => user._id !== id));
      } catch (error) {
        console.error("Error deleting user", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/profile');
  };

  const getImageUrl = (profilePicture) => {
    if (!profilePicture) return defaultAvatar;
    if (profilePicture.startsWith('http')) return profilePicture;
    
    const cleanPath = profilePicture.replace(/\\/g, '/');
    if (cleanPath.startsWith('uploads/')) {
      return `http://localhost:5000/${cleanPath}`;
    }
    return `http://localhost:5000/uploads/profile-pictures/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 p-8 font-['Inter']">
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 bg-gray-800 hover:bg-emerald-600 rounded-full transition duration-300"
            title="Back to Profile"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            SkillSwap Admin
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={openStatsModal}
            className="flex items-center gap-2 bg-indigo-600/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition duration-300 shadow-lg shadow-indigo-900/20"
          >
            <TrendingUp size={18} />
            Match Reports
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition duration-300 shadow-lg shadow-red-900/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-900/50 border-b border-emerald-700/50">
              <tr>
                <th className="p-5 font-bold text-emerald-400 uppercase tracking-wider text-sm">Name</th>
                <th className="p-5 font-bold text-emerald-400 uppercase tracking-wider text-sm">Email</th>
                <th className="p-5 font-bold text-emerald-400 uppercase tracking-wider text-sm">Role</th>
                <th className="p-5 font-bold text-red-400 uppercase tracking-wider text-sm text-center">Reports</th>
                <th className="p-5 font-bold text-emerald-400 uppercase tracking-wider text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/30">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-emerald-900/20 transition duration-200">
                  <td className="p-5 font-medium text-white flex items-center gap-3">
                    <img 
                      src={getImageUrl(user.profilePicture)} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/50"
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                    />
                    {user.name}
                  </td>
                  <td className="p-5 text-gray-400">{user.email}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                      user.role === 'admin' 
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' 
                        : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="p-5 text-center">
                    {user.reportCount > 0 ? (
                      <span className="bg-red-900/50 text-red-400 border border-red-700/50 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-max mx-auto">
                        <AlertTriangle size={12} /> {user.reportCount}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                  </td>

                  <td className="p-5 flex justify-center gap-3">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-2 bg-blue-900/40 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="p-2 bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={user.role === 'admin'}
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isStatsModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-gray-900 border border-indigo-700/50 p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col"
            >
              <button 
                onClick={() => {
                  if (selectedSkillForDetails) {
                    setSelectedSkillForDetails(null);
                  } else {
                    setIsStatsModalOpen(false);
                  }
                }} 
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition bg-gray-800 p-2 rounded-full z-10"
              >
                {selectedSkillForDetails ? <ArrowLeft size={20} /> : <X size={20} />}
              </button>
              
              <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <Activity size={28} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {selectedSkillForDetails ? `Details: ${selectedSkillForDetails.skill}` : 'Platform Skill Distribution'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedSkillForDetails ? 'Users mapped to this skill' : 'Live data based on current user profiles'}
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto session-list flex-1 pr-2">
                {isLoadingStats ? (
                  <div className="py-12 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  </div>
                ) : selectedSkillForDetails ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30 flex items-center justify-between">
                           <span className="text-xs text-emerald-500 uppercase font-black tracking-widest">Total Teachers</span>
                           <span className="text-2xl font-black text-emerald-400">{selectedSkillForDetails.teachCount}</span>
                       </div>
                       <div className="bg-teal-950/20 p-4 rounded-xl border border-teal-900/30 flex items-center justify-between">
                           <span className="text-xs text-teal-500 uppercase font-black tracking-widest">Total Learners</span>
                           <span className="text-2xl font-black text-teal-400">{selectedSkillForDetails.learnCount}</span>
                       </div>
                    </div>

                    <div className="bg-black/40 rounded-xl border border-gray-800 overflow-hidden">
                       <h3 className="bg-emerald-900/40 p-3 text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-900/50">Users Teaching {selectedSkillForDetails.skill}</h3>
                       <div className="p-4 space-y-3">
                           {selectedSkillForDetails.teachers.length > 0 ? (
                               selectedSkillForDetails.teachers.map(t => (
                                   <div key={`t-${t._id}`} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                                       <img src={getImageUrl(t.profilePicture)} alt={t.name} className="w-8 h-8 rounded-full object-cover border border-emerald-500/30" />
                                       <div>
                                           <p className="text-sm font-bold text-white">{t.name}</p>
                                           <p className="text-xs text-gray-400">{t.email}</p>
                                       </div>
                                   </div>
                               ))
                           ) : (
                               <p className="text-sm text-gray-500 italic">No users currently teaching this skill.</p>
                           )}
                       </div>
                    </div>

                    <div className="bg-black/40 rounded-xl border border-gray-800 overflow-hidden">
                       <h3 className="bg-teal-900/40 p-3 text-sm font-bold text-teal-400 uppercase tracking-widest border-b border-teal-900/50">Users Learning {selectedSkillForDetails.skill}</h3>
                       <div className="p-4 space-y-3">
                           {selectedSkillForDetails.learners.length > 0 ? (
                               selectedSkillForDetails.learners.map(l => (
                                   <div key={`l-${l._id}`} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                                       <img src={getImageUrl(l.profilePicture)} alt={l.name} className="w-8 h-8 rounded-full object-cover border border-teal-500/30" />
                                       <div>
                                           <p className="text-sm font-bold text-white">{l.name}</p>
                                           <p className="text-xs text-gray-400">{l.email}</p>
                                       </div>
                                   </div>
                               ))
                           ) : (
                               <p className="text-sm text-gray-500 italic">No users currently learning this skill.</p>
                           )}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchStats.length > 0 ? matchStats.map((stat, index) => {
                      const maxCount = Math.max(...matchStats.map(s => s.totalCount));
                      const widthPercent = `${(stat.totalCount / maxCount) * 100}%`;
                      
                      return (
                        <div 
                          key={index} 
                          onClick={() => setSelectedSkillForDetails(stat)}
                          className="bg-black/40 p-4 rounded-xl border border-gray-800 relative overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-colors group"
                        >
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-indigo-900/20 z-0 transition-all duration-1000 group-hover:bg-indigo-900/40"
                            style={{ width: widthPercent }}
                          ></div>
                          
                          <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <p className="text-lg font-bold text-indigo-300 flex items-center gap-2">
                                    {stat.skill}
                                    <ChevronRight size={16} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <div className="flex gap-4 mt-1 text-xs font-medium">
                                    <span className="text-emerald-400">{stat.teachCount} Teaching</span>
                                    <span className="text-teal-400">{stat.learnCount} Learning</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400 uppercase font-bold tracking-widest hidden sm:inline">Total Impact</span>
                              <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-black text-xl border border-indigo-500/30">
                                {stat.totalCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                        <div className="text-center py-8 text-gray-500 italic border border-dashed border-gray-700 rounded-xl">
                            No skills data available in the current database.
                        </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-gray-900 border border-emerald-700/50 p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto session-list"
            >
              <button 
                onClick={() => setSelectedUser(null)} 
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition bg-gray-800 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">User Profile</h2>
              
              <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-800">
                <img 
                  src={getImageUrl(selectedUser.profilePicture)} 
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold text-emerald-400">{selectedUser.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-900/30 text-purple-400 border border-purple-700/50' 
                        : 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/50'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm flex items-center gap-2 mb-2">
                    <User size={14} /> {selectedUser.email}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black/40 p-5 rounded-xl border border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Current Status</p>
                    <p className="text-sm text-gray-300 italic">
                      {selectedUser.status ? `"${selectedUser.status}"` : "No status set."}
                    </p>
                  </div>
                  
                  <div className="bg-black/40 p-5 rounded-xl border border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-1">
                      <Linkedin size={12} /> LinkedIn Profile
                    </p>
                    {selectedUser.socials?.linkedin ? (
                      <a 
                        href={selectedUser.socials.linkedin.startsWith('http') ? selectedUser.socials.linkedin : `https://${selectedUser.socials.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate block"
                      >
                        {selectedUser.socials.linkedin}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600 italic">Not provided</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/20 p-5 rounded-xl border border-emerald-900/30">
                    <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mb-3">Teaching Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skillsToTeach && selectedUser.skillsToTeach.length > 0 ? (
                        selectedUser.skillsToTeach.map((s, i) => (
                          <span key={i} className="bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-3 py-1 rounded-full text-xs font-medium">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-600 text-xs italic">No skills listed</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-teal-950/20 p-5 rounded-xl border border-teal-900/30">
                    <p className="text-[10px] text-teal-500 uppercase font-black tracking-widest mb-3">Learning Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skillsToLearn && selectedUser.skillsToLearn.length > 0 ? (
                        selectedUser.skillsToLearn.map((s, i) => (
                          <span key={i} className="bg-teal-900/40 text-teal-300 border border-teal-700/50 px-3 py-1 rounded-full text-xs font-medium">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-600 text-xs italic">No skills listed</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedUser.reports && selectedUser.reports.length > 0 && (
                  <div className="mt-6 bg-red-950/20 p-5 rounded-xl border border-red-900/30">
                    <p className="text-[10px] text-red-500 uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                      <AlertTriangle size={14} /> User Complaints ({selectedUser.reports.length})
                    </p>
                    
                    <div className="space-y-3">
                      {selectedUser.reports.map((report, index) => (
                        <div key={index} className="bg-black/40 p-4 rounded-lg border border-red-900/20">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold text-red-400">Reason: {report.reason}</p>
                            <span className="text-[10px] text-gray-500">
                              Reported by: {report.reporter?.name || 'Unknown User'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed bg-black/20 p-3 rounded border border-white/5">
                            {report.description || "No detailed description provided."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .session-list::-webkit-scrollbar { width: 8px; }
        .session-list::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .session-list::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.4); border-radius: 10px; }
        .session-list::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.8); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;