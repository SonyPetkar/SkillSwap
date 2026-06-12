import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, LogOut, ArrowLeft, X, Linkedin, User } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
// Ensure you have this placeholder image available in your assets folder
import defaultAvatar from '../assets/avatar.jpeg'; 

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); 
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

  // HELPER: Formats the image URL correctly to fix broken image links
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
      
      {/* Header & Navigation */}
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
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition duration-300 shadow-lg shadow-red-900/20"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Main Table Area */}
      <div className="max-w-7xl mx-auto bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-900/50 border-b border-emerald-700/50">
              <tr>
                <th className="p-5 font-bold text-emerald-400 uppercase tracking-wider text-sm">Name</th>
                <th className="p-5 font-bold text-emerald-400 uppercase tracking-wider text-sm">Email</th>
                <th className="p-5 font-bold text-emerald-400 uppercase tracking-wider text-sm">Role</th>
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
                  <td colSpan="4" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed User Information Modal */}
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
              
              {/* Header: Avatar, Name, Email, Role */}
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
                {/* General Info Grid */}
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

                {/* Skills Grid */}
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