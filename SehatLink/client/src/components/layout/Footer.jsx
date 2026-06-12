import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                ❤️
              </div>
              <span className="text-lg font-bold">SehatLink</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your health, our priority. Quality healthcare at your fingertips.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-300">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/doctors"
                  className="text-gray-400 hover:text-white transition"
                >
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-300">
              Contact Us
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 +92 300 1234567</li>
              <li>✉️ support@sehatlink.com</li>
              <li>📍 Lahore, Pakistan</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-300">
              Follow Us
            </h3>
            <div className="flex gap-3 text-xl">
              <a href="#" className="hover:text-blue-400">
                insta
              </a>
              <a href="#" className="hover:text-blue-400">
                twitter
              </a>
              <a href="#" className="hover:text-blue-400">
                facebook
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Made with ❤️ in Pakistan
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} SehatLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;