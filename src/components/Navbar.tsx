import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Droplets, User, LogOut, Search, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Droplets className="w-8 h-8 text-red-600 fill-current" />
            <span className="text-xl font-black text-gray-900 tracking-tight">BloodConnect</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/search" className="text-gray-600 hover:text-red-600 font-medium transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Donor Map
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-red-600 font-medium transition-colors flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900">{user.name}</span>
                    <span className="text-[10px] text-red-600 uppercase font-black tracking-widest">{user.bloodGroup}</span>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Login</Link>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  Become a Donor
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
