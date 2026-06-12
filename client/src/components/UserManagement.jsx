import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit3, ShieldOff, Shield, Eye } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    status: '',
    skillsToTeach: '',
    skillsToLearn: ''
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { 'x-auth-token': token }
      });
      setUsers(response.data.users);
      setTotalRecords(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Toggle block status for this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/users/${id}/suspend`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      status: user.status || '',
      skillsToTeach: user.skillsToTeach ? user.skillsToTeach.join(', ') : '',
      skillsToLearn: user.skillsToLearn ? user.skillsToLearn.join(', ') : ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        name: editForm.name,
        status: editForm.status,
        skillsToTeach: editForm.skillsToTeach.split(',').map(s => s.trim()).filter(s => s),
        skillsToLearn: editForm.skillsToLearn.split(',').map(s => s.trim()).filter(s => s)
      };

      await axios.put(`http://localhost:5000/api/admin/users/${selectedUser._id}`, payload, {
        headers: { 'x-auth-token': token }
      });
      
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  if (loading) return <div className="text-white p-6">Loading records...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Platform Users</h1>
        <div className="bg-emerald-900/50 border border-emerald-500/50 px-4 py-2 rounded-none">
          <span className="text-emerald-300 font-bold">Total Registered Records: {totalRecords}</span>
        </div>
      </div>

      <div className="bg-black/40 border border-gray-800 p-0 overflow-x-auto rounded-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800 text-gray-400">
              <th className="p-4 font-semibold text-sm">Avatar</th>
              <th className="p-4 font-semibold text-sm">Credentials</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm">Reports</th>
              <th className="p-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <img 
                    src={user.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${user.profilePicture}` : 'https://placehold.co/150x150?text=User'} 
                    alt="User" 
                    className="w-12 h-12 object-cover rounded-none border border-gray-600"
                  />
                </td>
                <td className="p-4">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-gray-500 text-xs">{user.email}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold ${user.isBlocked ? 'bg-red-900/50 text-red-400 border border-red-500/50' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50'} rounded-none`}>
                    {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`font-bold ${user.reportCount > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {user.reportCount}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openViewModal(user)} className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-none transition-all">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => openEditModal(user)} className="p-2 bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white rounded-none transition-all">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleSuspend(user._id)} className={`p-2 rounded-none transition-all ${user.isBlocked ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white' : 'bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white'}`}>
                    {user.isBlocked ? <Shield size={16} /> : <ShieldOff size={16} />}
                  </button>
                  <button onClick={() => handleDelete(user._id)} className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-none transition-all">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-gray-900 border border-gray-700 p-8 rounded-none w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 uppercase">Edit User Record</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-black/40 border border-gray-700 p-3 rounded-none text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Status Message</label>
                  <input type="text" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-black/40 border border-gray-700 p-3 rounded-none text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Skills to Teach (comma separated)</label>
                  <input type="text" value={editForm.skillsToTeach} onChange={e => setEditForm({...editForm, skillsToTeach: e.target.value})} className="w-full bg-black/40 border border-gray-700 p-3 rounded-none text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Skills to Learn (comma separated)</label>
                  <input type="text" value={editForm.skillsToLearn} onChange={e => setEditForm({...editForm, skillsToLearn: e.target.value})} className="w-full bg-black/40 border border-gray-700 p-3 rounded-none text-white outline-none focus:border-emerald-500" />
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-500 font-bold hover:text-gray-300">Cancel</button>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-none font-bold text-white uppercase">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isViewModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-gray-900 border border-gray-700 p-8 rounded-none w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-white uppercase">User Details & Reports</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-white font-bold">X</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex flex-col items-center p-4 border border-gray-800 bg-black/20 rounded-none">
                  <img src={selectedUser.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${selectedUser.profilePicture}` : 'https://placehold.co/150x150?text=User'} alt="User" className="w-32 h-32 object-cover rounded-none border-2 border-emerald-500 mb-4" />
                  <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                </div>
                <div className="p-4 border border-gray-800 bg-black/20 rounded-none space-y-4">
                  <div>
                    <span className="block text-xs text-gray-500 uppercase">Teaching</span>
                    <p className="text-white text-sm">{selectedUser.skillsToTeach?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase">Learning</span>
                    <p className="text-white text-sm">{selectedUser.skillsToLearn?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase">Account Status</span>
                    <p className={selectedUser.isBlocked ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-bold text-red-400 mb-4 uppercase">Filed Reports ({selectedUser.reports?.length || 0})</h3>
                {selectedUser.reports && selectedUser.reports.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.reports.map(report => (
                      <div key={report._id} className="p-4 bg-red-900/10 border border-red-900/30 rounded-none">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-bold text-sm">Reason: {report.reason}</span>
                          <span className="text-gray-500 text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{report.description}</p>
                        <p className="text-xs text-red-500/70">Reported by: {report.reporter?.email}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No reports filed against this user.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;