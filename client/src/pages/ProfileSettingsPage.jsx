/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/profileSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import { Edit, Eye, EyeOff, Lock, User as UserIcon, Link, AtSign, Globe, Sparkles, Search, CheckCircle, X as CloseIcon, Brain, TrendingUp } from 'lucide-react';
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
        // Themed Input Style
        className={`w-full p-3 pl-12 border ${color === 'red' ? 'border-red-700/50 focus:ring-red-400 focus:border-red-400' : 'border-emerald-700/50 focus:ring-emerald-500 focus:border-emerald-500'} rounded-lg bg-black/30 text-white placeholder-gray-500 focus:ring-2 transition-colors`}
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
    
    // Base score calculation based on completion
    let score = 20;
    if (teachCount >= 1) score += 20;
    if (learnCount >= 1) score += 20;
    if (hasStatus) score += 20;
    if (hasAvatar) score += 20;
    
    // Dynamic Tip based on missing info
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
// --- END AI PROFILE ASSESSMENT ---

// --- NEW WOW FACTOR COMPONENT: SKILL LEVEL INDICATOR ---
const SkillLevelIndicator = ({ teachSkills, learnSkills }) => {
    const totalSkills = teachSkills.length + learnSkills.length;
    let level = 'Novice';
    let color = 'text-gray-500';

    if (totalSkills >= 1) {
        level = 'Explorer';
        color = 'text-yellow-400';
    }
    if (totalSkills >= 5) {
        level = 'Collaborator';
        color = 'text-cyan-400';
    }
    if (totalSkills >= 10) {
        level = 'Master Swapper';
        color = 'text-emerald-400';
    }

    return (
        <div className="p-4 bg-black/30 rounded-lg border border-teal-500/50 shadow-lg mt-6 text-center">
            <TrendingUp size={24} className={`mx-auto mb-2 ${color}`} />
            <h4 className="text-lg font-bold text-white">Current Swap Rank:</h4>
            <p className={`text-2xl font-extrabold ${color} transition-colors duration-300`}>
                {level}
            </p>
            <p className="text-sm text-gray-400 mt-1">Total skills tracked: {totalSkills}</p>
        </div>
    );
};
// --- END NEW WOW FACTOR ---


const ProfileSettingsPage = () => {
  // --- STATE (UNCHANGED) ---
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

  // --- LOGIC (UNCHANGED) ---
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
          socials: data.socials 
            ? { linkedin: data.socials.linkedin || '' } 
            : { linkedin: '' },
          skillsToTeach: data.skillsToTeach ? data.skillsToTeach.join(', ') : '',
          skillsToLearn: data.skillsToLearn ? data.skillsToLearn.join(', ') : ''
        });
        if (data.profilePicture) {
          setImagePreview(
            `http://localhost:5000/uploads/profile-pictures/${data.profilePicture}`
          );
        }
      } catch {
        setMessage('Failed to load profile data.');
      }
    };
    fetchProfile();
  }, []);

  const avatarSrc = imagePreview
    ? imagePreview
    : formData.profilePicture
    ? `http://localhost:5000/uploads/profile-pictures/${formData.profilePicture}`
    : defaultAvatar;

  // *** FIX: Enhanced Error Reporting and Image Persistence in handleUpdate ***
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
        headers: {
          'x-auth-token': token,
        },
      });
      
      const updatedUser = res.data;

      dispatch(setUser(updatedUser));
      setMessage('Profile updated successfully! (success)');

      // --- CRITICAL FRONTEND FIX: Update state with the new filename from server ---
      if (updatedUser.profilePicture) {
          setFormData(prev => ({ ...prev, profilePicture: updatedUser.profilePicture })); 
          setImagePreview(`http://localhost:5000/uploads/profile-pictures/${updatedUser.profilePicture}`);
      }
      
      navigate('/profile'); 
    } catch (error) {
      console.error('Profile Update Failed:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Update failed due to a server error. Check server console for details.';
      setMessage(errorMessage + ' (error)'); 
    }
  };
  
  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setMessage("New passwords don't match!");
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
      setPasswords(prev => ({ 
        ...prev, 
        currentPassword: '', 
        newPassword: '', 
        confirmNewPassword: '' 
      }));
    } catch (error) {
      console.error('Password Update Failed:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Password update failed. Please check your current password.';
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

  // --- Skill Tag Handlers (NEW UI LOGIC) ---
  const handleSkillTagRemove = (field, skillToRemove) => {
    const currentSkillsString = formData[field];
    const updatedSkillsArray = currentSkillsString.split(',').map(s => s.trim()).filter(s => s && s !== skillToRemove);
    setFormData(prev => ({ ...prev, [field]: updatedSkillsArray.join(', ') }));
  };

  const renderSkillTags = (field, theme) => {
    const currentSkills = formData[field].split(',').map(s => s.trim()).filter(s => s);
    
    if (currentSkills.length === 0) {
        return <p className="text-gray-500 italic text-sm mt-2">Start typing skills above, separated by commas.</p>;
    }

    return (
        <AnimatePresence>
            <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">
                {currentSkills.map((skill, index) => (
                    <motion.div
                        key={`${field}-${skill}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`flex items-center text-xs font-medium rounded-full pr-1.5 pl-3 py-1 ${
                            theme === 'teach' 
                                ? 'bg-emerald-800/50 border border-emerald-600 text-emerald-200' 
                                : 'bg-teal-800/50 border border-teal-600 text-teal-200'
                        }`}
                    >
                        {skill}
                        <button
                            type="button"
                            onClick={() => handleSkillTagRemove(field, skill)}
                            className="ml-1.5 p-0.5 rounded-full hover:bg-black/20 transition-colors"
                            title={`Remove ${skill}`}
                        >
                            <CloseIcon size={12} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </AnimatePresence>
    );
  };
  // --- End Skill Tag Handlers ---

  // Calculated skills arrays for indicator
  const teachSkillsArray = formData.skillsToTeach.split(',').map(s => s.trim()).filter(s => s);
  const learnSkillsArray = formData.skillsToLearn.split(',').map(s => s.trim()).filter(s => s);


  return (
    // Themed background
    <div className="min-h-screen relative w-full bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-200 animate-gradient-shift overflow-x-hidden font-['Inter',_sans-serif]">
      <AnimatedGradientStyles />

      {/* Foreground content */}
      <div className="relative z-10">
        <Navbar />

        {/* Main Content Card (Themed Glassmorphism) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/40 backdrop-blur-xl max-w-5xl mx-auto p-6 md:p-8 shadow-2xl rounded-2xl mt-8 mb-12 border border-emerald-700/50" // Increased max-width for columns
        >
          <h2 className="text-3xl font-bold mb-6 text-emerald-400 text-center">Customize Your Profile</h2>
          
          {/* Message Banner */}
          {message && ( 
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mb-6 p-3 rounded-lg font-medium text-center ${
                message.includes('success') 
                  ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                  : 'bg-red-900/50 text-red-300 border border-red-700/50'
              }`}
            >
              {message.replace(/\s\((success|error)\)$/, '')} {/* Remove internal flags */}
            </motion.div>
          )}

          {/* Avatar + Upload (Themed) */}
          <div className="mb-8 flex justify-center">
            <label htmlFor="profilePicture" className="cursor-pointer relative group">
              <div className="w-36 h-36 rounded-full bg-gray-700 flex items-center justify-center relative overflow-hidden border-4 border-emerald-500 shadow-xl transition-transform group-hover:scale-[1.03]">
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                />
                {/* Overlay for Edit Icon */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Edit size={36} className="text-emerald-300" />
                </div>
              </div>
            </label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* --- NEW WOW FACTOR: AI PROFILE SCORE & SKILL INDICATOR --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <AiProfileAssessment formData={formData} />
              <SkillLevelIndicator teachSkills={teachSkillsArray} learnSkills={learnSkillsArray} />
          </div>
          {/* --- END WOW FACTOR --- */}


          {/* Form Fields: Main Grid Layout */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* COLUMN 1: General Info & Socials */}
            <div className="space-y-8">
                {/* General Settings Section */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <h3 className="text-xl font-semibold text-white border-b border-emerald-900/50 pb-2 mb-4 flex items-center gap-2"><UserIcon size={20} className="text-emerald-400"/> General Information</h3>
                    
                    {/* Name */}
                    <ThemedInputWithIcon
                      id="name" label="Full Name" icon={UserIcon}
                      placeholder="Your display name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />

                    {/* Status */}
                    <div className="mt-4">
                      <ThemedInputWithIcon
                        id="status" label="Current Status" icon={AtSign}
                        placeholder="e.g. Learning React, Available for mentoring"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      />
                    </div>
                </motion.div>

                {/* Social Links Section (ONLY LINKEDIN) */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <h3 className="text-xl font-semibold text-white border-b border-emerald-900/50 pb-2 mb-4 flex items-center gap-2"><Link size={20} className="text-emerald-400"/> Social Profiles</h3>

                    {/* LinkedIn URL */}
                    <ThemedInputWithIcon
                      id="linkedin" label="LinkedIn URL" icon={Globe}
                      placeholder="https://linkedin.com/in/..."
                      value={formData.socials.linkedin}
                      // Correctly update nested state
                      onChange={e => setFormData(prev => ({ ...prev, socials: { ...prev.socials, linkedin: e.target.value } }))}
                    />
                </motion.div>
            </div>


            {/* COLUMN 2: Skills & Security */}
            <div className="space-y-8">
                {/* Skills Section (Includes Tag UI) */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h3 className="text-xl font-semibold text-white border-b border-emerald-900/50 pb-2 mb-4 flex items-center gap-2"><Sparkles size={20} className="text-emerald-400"/> Skills & Swaps</h3>

                    {/* Skills You Can Teach */}
                    <div className="relative">
                        <ThemedInputWithIcon
                            id="skillsToTeach" label="Skills You Can Teach (comma-separated)" icon={Edit}
                            placeholder="e.g. JavaScript, Python, UI Design"
                            value={formData.skillsToTeach}
                            onChange={e => setFormData({ ...formData, skillsToTeach: e.target.value })}
                        />
                        <AnimatePresence>{renderSkillTags('skillsToTeach', 'teach')}</AnimatePresence>
                    </div>

                    {/* Skills You Want to Learn */}
                    <div className="mt-4 relative">
                      <ThemedInputWithIcon
                        id="skillsToLearn" label="Skills You Want to Learn (comma-separated)" icon={Search}
                        placeholder="e.g. Go, Machine Learning, Figma"
                        value={formData.skillsToLearn}
                        onChange={e => setFormData({ ...formData, skillsToLearn: e.target.value })}
                      />
                       <AnimatePresence>{renderSkillTags('skillsToLearn', 'learn')}</AnimatePresence>
                    </div>
                </motion.div>

                {/* Change Password Section */}
                <div className="pt-4 border-t border-gray-700/50 space-y-6">
                    <h3 className="text-xl font-semibold text-red-400 border-b border-red-900/50 pb-2 flex items-center gap-2"><Lock size={20} className="text-red-400"/> Security Settings</h3>
                    
                    {/* Password Fields */}
                    {[
                      { key: 'currentPassword', placeholder: 'Current Password', visibleKey: 'currentPasswordVisible', label: 'Current Password', id: 'currentPassword' },
                      { key: 'newPassword', placeholder: 'New Password (min 6 chars)', visibleKey: 'newPasswordVisible', label: 'New Password', id: 'newPassword' },
                      { key: 'confirmNewPassword', placeholder: 'Confirm New Password', visibleKey: 'confirmNewPasswordVisible', label: 'Confirm New Password', id: 'confirmNewPassword' }
                    ].map(({ key, placeholder, visibleKey, label, id }) => (
                      <div key={key} className="relative">
                        <label htmlFor={id} className="block mb-1 font-semibold text-gray-300"> {label} </label>
                        <div className="relative">
                          <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          <input
                            id={id}
                            type={passwords[visibleKey] ? 'text' : 'password'}
                            placeholder={placeholder}
                            value={passwords[key]}
                            onChange={e => setPasswords(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full p-3 pl-12 border border-red-700/50 rounded-lg bg-black/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors"
                          />
                          {/* Eye Icon (Themed) */}
                          <div
                            className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-red-400 hover:text-red-300"
                            onClick={() => setPasswords(prev => ({ ...prev, [visibleKey]: !prev[visibleKey] }))}
                          >
                            {passwords[visibleKey] ? (<EyeOff size={20} />) : (<Eye size={20} />)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Change Password Button (Themed Red) */}
                    <motion.button
                      onClick={handlePasswordChange}
                      whileHover={{ scale: 1.01, y: -2, boxShadow: "0 6px 15px rgba(239, 68, 68, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 shadow-md transition-all duration-300 font-bold"
                    >
                      Change Password
                    </motion.button>
                </div>
            </div>
          </div>
          {/* End Main Grid Layout */}

          {/* Save Changes Button (Full Width, below the grid) */}
          <motion.button
            onClick={handleUpdate}
            whileHover={{ scale: 1.01, y: -2, boxShadow: "0 6px 15px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-10 py-3 rounded-lg font-bold text-white text-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 shadow-md transition-all duration-300"
          >
            Save All Changes
          </motion.button>

        </motion.div>

        <Footer />
      </div>
    </div>
  );
};

export default ProfileSettingsPage;