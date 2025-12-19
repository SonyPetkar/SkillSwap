/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/profileSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import { Edit, Eye, EyeOff, Lock, User as UserIcon, Link, AtSign, Globe, Sparkles, Search, CheckCircle, X as CloseIcon, Brain, TrendingUp, ShieldAlert } from 'lucide-react';
import defaultAvatar from '../assets/avatar.jpeg';
import Footer from '../components/footer/Footer';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A utility component to add our animated gradient styles.
 */
const AnimatedGradientStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    .animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 15s ease infinite; }
  `}</style>
);

// Helper component for themed inputs with icons
const ThemedInputWithIcon = ({ id, label, type = 'text', placeholder, value, onChange, icon: Icon, color = 'emerald', children }) => (
  <div className="relative">
    <label htmlFor={id} className="block mb-1 font-semibold text-gray-300">
      {label}
    </label>
    <div className="relative">
      <Icon size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500`} />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-3 pl-12 border ${color === 'red' ? 'border-red-900/50 focus:ring-red-500/30 focus:border-red-500' : 'border-emerald-700/50 focus:ring-emerald-500/30 focus:border-emerald-500'} rounded-lg bg-black/30 text-white placeholder-gray-500 focus:ring-2 transition-colors outline-none`}
      />
      {children}
    </div>
  </div>
);

// --- AI PROFILE ASSESSMENT ---
const AiProfileAssessment = ({ formData }) => {
    const teachCount = formData.skillsToTeach.split(',').filter(s => s.trim()).length;
    const learnCount = formData.skillsToLearn.split(',').filter(s => s.trim()).length;
    const hasStatus = !!formData.status.trim();
    const hasAvatar = !!formData.profilePicture;
    
    let score = 20;
    if (teachCount >= 1) score += 20;
    if (learnCount >= 1) score += 20;
    if (hasStatus) score += 20;
    if (hasAvatar) score += 20;
    
    const getTip = () => {
        if (!hasAvatar) return "Upload a profile picture to build trust!";
        if (!hasStatus) return "Set your current status to let matches know your focus.";
        if (teachCount === 0) return "Add skills you can teach! This is essential for matching.";
        if (learnCount === 0) return "Add skills you want to learn to attract mentors.";
        if (teachCount < 3) return "Great start! Add 3-5 'teach' skills for better exposure.";
        if (learnCount < 3) return "Awesome! Add more learning goals for diverse swap options.";
        return "Your profile is excellent! Time to find some matches!";
    };

    return (
        <motion.div
            className="p-4 bg-black/30 rounded-lg border border-emerald-500/50 shadow-lg mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Brain size={20} className="text-emerald-400" />
                    <h4 className="text-lg font-bold text-white">AI Profile Score</h4>
                </div>
                <div className="text-xl font-extrabold text-emerald-300">{score}%</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                    className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                ></motion.div>
            </div>
            <p className="text-sm text-gray-400 mt-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                {getTip()}
            </p>
        </motion.div>
    );
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
            <p className={`text-2xl font-extrabold ${color} transition-colors duration-300`}> {level} </p>
            <p className="text-sm text-gray-400 mt-1">Total skills tracked: {totalSkills}</p>
        </div>
    );
};


const ProfileSettingsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: '',
    status: '',
    socials: { linkedin: '' },
    skillsToTeach: '',
    skillsToLearn: ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    currentPasswordVisible: false,
    newPasswordVisible: false,
    confirmNewPasswordVisible: false
  });
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(
          'http://localhost:5000/api/users/profile',
          { headers: { 'x-auth-token': token } }
        );
        const data = res.data;
        setFormData({
          name: data.name || '',
          profilePicture: data.profilePicture || '',
          status: data.status || '',
          socials: data.socials ? { linkedin: data.socials.linkedin || '' } : { linkedin: '' },
          skillsToTeach: data.skillsToTeach ? data.skillsToTeach.join(', ') : '',
          skillsToLearn: data.skillsToLearn ? data.skillsToLearn.join(', ') : ''
        });
        if (data.profilePicture) {
          setImagePreview(`http://localhost:5000/uploads/profile-pictures/${data.profilePicture}`);
        }
      } catch {
        setMessage('Failed to load profile data.');
      }
    };
    fetchProfile();
  }, []);

  const avatarSrc = imagePreview ? imagePreview : formData.profilePicture ? `http://localhost:5000/uploads/profile-pictures/${formData.profilePicture}` : defaultAvatar;

  const handleUpdate = async () => {
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('status', formData.status);

    const skillsToTeachArray = formData.skillsToTeach.split(',').map((s) => s.trim()).filter((s) => s !== '');
    const skillsToLearnArray = formData.skillsToLearn.split(',').map((s) => s.trim()).filter((s) => s !== '');

    skillsToTeachArray.forEach((skill) => { payload.append('skillsToTeach[]', skill); });
    skillsToLearnArray.forEach((skill) => { payload.append('skillsToLearn[]', skill); });

    payload.append('socials[linkedin]', formData.socials.linkedin);
    payload.append('socials[facebook]', ''); 
    payload.append('socials[twitter]', '');

    if (formData.profilePicture instanceof File) {
      payload.append('profilePicture', formData.profilePicture);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', payload, {
        headers: { 'x-auth-token': token },
      });
      const updatedUser = res.data;
      dispatch(setUser(updatedUser));
      setMessage('Profile updated successfully! (success)');
      if (updatedUser.profilePicture) {
          setFormData(prev => ({ ...prev, profilePicture: updatedUser.profilePicture })); 
          setImagePreview(`http://localhost:5000/uploads/profile-pictures/${updatedUser.profilePicture}`);
      }
      navigate('/profile'); 
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed.';
      setMessage(errorMessage + ' (error)'); 
    }
  };
  
  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setMessage("New passwords don't match! (error)");
      return;
    }
    if (passwords.newPassword.length < 6) {
        setMessage("Password must be at least 6 characters. (error)");
        return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/users/change-password',
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        { headers: { 'x-auth-token': token } }
      );
      setMessage('Password updated successfully! (success)');
      setPasswords({ 
        currentPassword: '', 
        newPassword: '', 
        confirmNewPassword: '',
        currentPasswordVisible: false,
        newPasswordVisible: false,
        confirmNewPasswordVisible: false
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password update failed.';
      setMessage(errorMessage + ' (error)');
    }
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSkillTagRemove = (field, skillToRemove) => {
    const currentSkillsString = formData[field];
    const updatedSkillsArray = currentSkillsString.split(',').map(s => s.trim()).filter(s => s && s !== skillToRemove);
    setFormData(prev => ({ ...prev, [field]: updatedSkillsArray.join(', ') }));
  };

  const renderSkillTags = (field, theme) => {
    const currentSkills = formData[field].split(',').map(s => s.trim()).filter(s => s);
    if (currentSkills.length === 0) return <p className="text-gray-500 italic text-sm mt-2">Start typing skills above, separated by commas.</p>;

    return (
        <AnimatePresence>
            <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">
                {currentSkills.map((skill, index) => (
                    <motion.div
                        key={`${field}-${skill}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`flex items-center text-xs font-medium rounded-full pr-1.5 pl-3 py-1 ${theme === 'teach' ? 'bg-emerald-800/50 border border-emerald-600 text-emerald-200' : 'bg-teal-800/50 border border-teal-600 text-teal-200'}`}
                    >
                        {skill}
                        <button type="button" onClick={() => handleSkillTagRemove(field, skill)} className="ml-1.5 p-0.5 rounded-full hover:bg-black/20 transition-colors">
                            <CloseIcon size={12} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </AnimatePresence>
    );
  };

  const teachSkillsArray = formData.skillsToTeach.split(',').map(s => s.trim()).filter(s => s);
  const learnSkillsArray = formData.skillsToLearn.split(',').map(s => s.trim()).filter(s => s);

  return (
    <div className="min-h-screen relative w-full bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-x-hidden font-['Inter',_sans-serif]">
      <AnimatedGradientStyles />
      <div className="relative z-10">
        <Navbar />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/40 backdrop-blur-xl max-w-5xl mx-auto p-6 md:p-8 shadow-2xl rounded-2xl mt-8 mb-12 border border-emerald-700/50"
        >
          <h2 className="text-3xl font-bold mb-6 text-emerald-400 text-center uppercase tracking-wider">Account Settings</h2>
          
          {message && ( 
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mb-6 p-4 rounded-lg font-medium text-center shadow-lg backdrop-blur-md ${message.includes('success') ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/50' : 'bg-red-900/40 text-red-300 border border-red-500/50'}`}
            >
              {message.replace(/\s\((success|error)\)$/, '')}
            </motion.div>
          )}

          <div className="mb-8 flex justify-center">
            <label htmlFor="profilePicture" className="cursor-pointer relative group">
              <div className="w-36 h-36 rounded-full bg-gray-700 flex items-center justify-center relative overflow-hidden border-4 border-emerald-500 shadow-xl transition-transform group-hover:scale-[1.03]">
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Edit size={36} className="text-emerald-300" />
                </div>
              </div>
            </label>
            <input type="file" id="profilePicture" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <AiProfileAssessment formData={formData} />
              <SkillLevelIndicator teachSkills={teachSkillsArray} learnSkills={learnSkillsArray} />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            
            {/* COLUMN 1: General Info & Socials */}
            <div className="space-y-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <h3 className="text-xl font-bold text-white border-b border-emerald-900/50 pb-3 mb-6 flex items-center gap-3">
                        <UserIcon size={24} className="text-emerald-500"/> Public Profile
                    </h3>
                    <div className="space-y-5">
                        <ThemedInputWithIcon id="name" label="Display Name" icon={UserIcon} placeholder="Your name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <ThemedInputWithIcon id="status" label="Personal Status" icon={AtSign} placeholder="What's on your mind?" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <h3 className="text-xl font-bold text-white border-b border-emerald-900/50 pb-3 mb-6 flex items-center gap-3">
                        <Link size={24} className="text-emerald-500"/> Connections
                    </h3>
                    <ThemedInputWithIcon id="linkedin" label="LinkedIn URL" icon={Globe} placeholder="https://linkedin.com/in/..." value={formData.socials.linkedin} onChange={e => setFormData(prev => ({ ...prev, socials: { ...prev.socials, linkedin: e.target.value } }))} />
                </motion.div>
            </div>

            {/* COLUMN 2: Skills & Security */}
            <div className="space-y-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h3 className="text-xl font-bold text-white border-b border-emerald-900/50 pb-3 mb-6 flex items-center gap-3">
                        <Sparkles size={24} className="text-emerald-500"/> Skills & Learning
                    </h3>
                    <div className="space-y-5">
                        <div className="relative">
                            <ThemedInputWithIcon id="skillsToTeach" label="I can Teach" icon={Edit} placeholder="React, Yoga, Italian..." value={formData.skillsToTeach} onChange={e => setFormData({ ...formData, skillsToTeach: e.target.value })} />
                            {renderSkillTags('skillsToTeach', 'teach')}
                        </div>
                        <div className="relative">
                            <ThemedInputWithIcon id="skillsToLearn" label="I want to Learn" icon={Search} placeholder="Python, Baking, Chess..." value={formData.skillsToLearn} onChange={e => setFormData({ ...formData, skillsToLearn: e.target.value })} />
                            {renderSkillTags('skillsToLearn', 'learn')}
                        </div>
                    </div>
                </motion.div>

                {/* --- UPDATED SECURITY SECTION --- */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-red-950/20 p-6 rounded-xl border border-red-900/30">
                    <h3 className="text-xl font-bold text-red-400 border-b border-red-900/50 pb-3 mb-6 flex items-center gap-3">
                        <ShieldAlert size={24} className="text-red-500"/> Security & Access
                    </h3>
                    
                    <div className="space-y-4">
                        {[
                          { key: 'currentPassword', placeholder: 'Current Password', visibleKey: 'currentPasswordVisible', label: 'Current Password', id: 'currentPassword' },
                          { key: 'newPassword', placeholder: 'New Password (min 6 chars)', visibleKey: 'newPasswordVisible', label: 'New Password', id: 'newPassword' },
                          { key: 'confirmNewPassword', placeholder: 'Confirm New Password', visibleKey: 'confirmNewPasswordVisible', label: 'Confirm New Password', id: 'confirmNewPassword' }
                        ].map(({ key, placeholder, visibleKey, label, id }) => (
                          <div key={key} className="relative">
                            <label htmlFor={id} className="block mb-1 text-sm font-semibold text-gray-400"> {label} </label>
                            <div className="relative">
                              <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <input
                                id={id}
                                type={passwords[visibleKey] ? 'text' : 'password'}
                                placeholder={placeholder}
                                value={passwords[key]}
                                onChange={e => setPasswords(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full p-3 pl-11 bg-black/40 border border-red-900/30 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-red-500/40 focus:border-red-500 outline-none transition-all text-sm"
                              />
                              <button
                                type="button"
                                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors"
                                onClick={() => setPasswords(prev => ({ ...prev, [visibleKey]: !prev[visibleKey] }))}
                              >
                                {passwords[visibleKey] ? (<EyeOff size={18} />) : (<Eye size={18} />)}
                              </button>
                            </div>
                          </div>
                        ))}

                        <motion.button
                          onClick={handlePasswordChange}
                          whileHover={{ scale: 1.01, backgroundColor: "rgba(220, 38, 38, 1)" }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-red-600/80 text-white py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all duration-300 font-bold text-sm uppercase tracking-wider mt-2"
                        >
                          Update Password
                        </motion.button>
                    </div>
                </motion.div>
            </div>
          </div>

          <motion.button
            onClick={handleUpdate}
            whileHover={{ scale: 1.01, y: -2, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-16 py-4 rounded-xl font-black text-white text-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 shadow-xl transition-all duration-300 uppercase tracking-widest"
          >
            Save Profile Discovery
          </motion.button>

        </motion.div>

        <Footer />
      </div>
    </div>
  );
};

export default ProfileSettingsPage;