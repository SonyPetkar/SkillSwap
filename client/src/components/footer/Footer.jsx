import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  const internalLinks = [
    { name: "Home", to: "/" },
    { name: "Profile", to: "/profile" },
    { name: "Login", to: "/login" },
    { name: "Signup", to: "/register" },
    { name: "Chat", to: "/chat" },
    { name: "Skill Matching", to: "/skill-matching" },
    { name: "Profile Settings", to: "/profile-settings" },
    { name: "About Us", to: "/about-us" },
  ];

  return (
    <footer className="relative z-10 bg-black/50 backdrop-blur-lg border-t-2 border-emerald-900/70 text-gray-300 font-['Inter',_sans-serif]">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8"> {/* Adjusted padding */}

        {/* 3-Column Layout for Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-sm mb-12"> {/* Kept bottom margin for spacing before copyright */}

          {/* Brand & Description (Column 1) */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-4 inline-block">
              SkillSwap
            </h2>
            <p className="text-gray-400 leading-relaxed pr-4">
              A collaborative platform igniting peer-to-peer learning and fostering skill development within a vibrant community.
            </p>
          </div>

          {/* Quick Links (Column 2) */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-100 mb-5">Quick Links</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {internalLinks.map(({ name, to }) => (
                <Link
                  key={name}
                  to={to}
                  className="text-gray-400 hover:text-emerald-400 hover:brightness-125 hover:translate-x-1 transition-all duration-300 ease-in-out"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect Info & Social Icons (Column 3) */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start"> {/* Use flex column and center items, align start on md */}
             <h3 className="text-lg font-semibold text-gray-100 mb-5">Connect With Us</h3>
             <p className="text-gray-400 leading-relaxed mb-6 text-center md:text-left"> {/* Center text on small screens, left on medium+ */}
               Follow us on social media for the latest updates, community highlights, and skill-sharing opportunities.
             </p>
             {/* Centered Social Links WITHIN this column */}
             <div className="flex justify-center md:justify-start space-x-6 items-center"> {/* Center icons by default, align start on md */}
               <a
                 href="#"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-gray-400 hover:text-white transition transform hover:scale-125 duration-300 ease-in-out p-1 rounded-full hover:bg-white/10"
                 aria-label="GitHub"
               >
                 <FaGithub size={24} />
               </a>
               <a
                 href="#"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-gray-400 hover:text-teal-400 transition transform hover:scale-125 duration-300 ease-in-out p-1 rounded-full hover:bg-teal-500/10"
                 aria-label="LinkedIn"
               >
                 <FaLinkedin size={24} />
               </a>
               <a
                 href="#"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-gray-400 hover:text-cyan-400 transition transform hover:scale-125 duration-300 ease-in-out p-1 rounded-full hover:bg-cyan-500/10"
                 aria-label="Twitter"
               >
                 <FaTwitter size={24} />
               </a>
             </div>
          </div>
        </div>

        {/* Centered Divider and Copyright (At the bottom) */}
        <div className="text-center text-gray-500 text-xs pt-5 border-t w-1/2 mx-auto border-emerald-900/70">
          © {new Date().getFullYear()} SkillSwap. All rights reserved. Built with passion.
        </div>
      </div>
    </footer>
  );
};

export default Footer;