import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Hayan School System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;