import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { AiOutlineLink, AiOutlineFileImage } from 'react-icons/ai'; 
import { FiX } from 'react-icons/fi'; // Red cross icon

const MessageInput = ({ sendMessage }) => {
 const [message, setMessage] = useState('');
 const [link, setLink] = useState('');
 const [file, setFile] = useState(null);
 const [previewUrl, setPreviewUrl] = useState(null);
 const [showLinkInput, setShowLinkInput] = useState(false);
 const fileInputRef = React.useRef(null); 

 const handleFileChange = (e) => {
 const selectedFile = e.target.files[0];
 if (selectedFile) {
 setFile(selectedFile);
 const filePreviewUrl = URL.createObjectURL(selectedFile);
 setPreviewUrl(filePreviewUrl); 
 }
 };

 const handleLinkChange = (e) => {
 setLink(e.target.value);
 };

 const handleAttachLink = () => {
 setShowLinkInput(true); 
 };

 const handleRemoveFile = () => {
 setFile(null);
 setPreviewUrl(null); 
 fileInputRef.current.value = ''; 
 };

 const handleSendMessage = () => {
 if (message.trim() === '' && !file && !link) {
 console.log('No message, file, or link to send');
 return; 
 }

 let finalMessage = message;

 if (link) {
 const formattedLink = !link.startsWith('http://') && !link.startsWith('https://')
 ? `http://${link}`
 : link;

 finalMessage = finalMessage.trim() ? `${finalMessage} (${formattedLink})` : formattedLink; 

 setLink(formattedLink);
 }

 sendMessage(finalMessage, file, link);

 // Clear inputs after sending
 setMessage('');
 setLink('');
 setFile(null);
 setPreviewUrl(null);
 setShowLinkInput(false);
 fileInputRef.current.value = ''; 
 };
  
 // Handler for keyboard events (Enter key to send)
 const handleKeyDown = (e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault(); 
 handleSendMessage();
 }
 };

 return (
 <div className="message-input flex flex-wrap gap-2 items-center p-4 bg-black/50 border border-emerald-700/50 rounded-lg shadow-md w-full">

 <input
 type="text"
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 onKeyDown={handleKeyDown} 
 placeholder="Type a message..."
 className="flex-1 min-w-[150px] p-3 border border-emerald-700/50 rounded-lg bg-gray-800/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />

 {/* Hidden File Input */}
 <input
 ref={fileInputRef} 
 type="file"
 accept="image/*,video/*,audio/*"
 onChange={handleFileChange}
 className="hidden" 
 />
 
 {/* File Attachment Button (Triggers the hidden input) */}
 <button
 onClick={() => fileInputRef.current.click()}
 title="Attach File"
 className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition duration-300 ease-in-out"
 >
 <AiOutlineFileImage className="text-white text-xl" />
 </button>


 {previewUrl && (
 <div className="preview mt-2 flex items-center">
 <div className="file-preview-container flex items-center mr-2">
 {file && file.type.startsWith('image') && <img src={previewUrl} alt="Preview" className="max-w-xs rounded-lg shadow-md" />}
 {file && file.type.startsWith('video') && <video src={previewUrl} controls className="max-w-xs rounded-lg shadow-md" />}
 {file && file.type.startsWith('audio') && <audio src={previewUrl} controls className="max-w-xs rounded-lg shadow-md" />}
 </div>
 <button
 onClick={handleRemoveFile}
 className="ml-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition duration-300 ease-in-out"
 >
 <FiX className="text-white text-xl" />
 </button>
 </div>
 )}

 <button
 onClick={handleAttachLink}
 title="Attach Link"
 className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition duration-300 ease-in-out"
 >
 <AiOutlineLink className="text-white text-xl" />
 </button>
 {showLinkInput && (
 <input
 type="text"
 value={link}
 onChange={handleLinkChange}
 placeholder="Enter a URL"
 className="p-3 border border-emerald-700/50 rounded-lg bg-gray-800/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
 />
 )}

 <button
 onClick={handleSendMessage}
 className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition duration-300 ease-in-out"
 >
 <FaPaperPlane className="text-white text-xl" />
 </button>

 </div>
 );
};

export default MessageInput;