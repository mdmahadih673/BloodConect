import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Droplets, User, Mail, Lock, Phone, MapPin, Calendar, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: 'A+',
    area: '',
    lat: 0,
    lng: 0
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
          setLocating(false);
        },
        (err) => {
          setError('Could not get location. Please enable GPS.');
          setLocating(false);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lat === 0) {
      setError('Location is required. Please enable GPS.');
      return;
    }
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100-64px)] flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl shadow-gray-200 p-10 border border-gray-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl text-red-600 mb-6">
            <Droplets className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Join the Network</h1>
          <p className="text-gray-500">Register as a blood donor and save lives</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-red-600 outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-red-600 outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-red-600 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-red-600 outline-none"
                  placeholder="017XXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-red-600 outline-none font-bold"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Area</label>
                <input
                  type="text"
                  required
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-red-600 outline-none"
                  placeholder="e.g. Dhaka"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className={locating ? "animate-bounce text-red-600" : "text-gray-400"} />
                  <span className="text-sm font-bold text-gray-600">
                    {formData.lat !== 0 ? 'Location Captured' : locating ? 'Locating...' : 'Location Required'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-xs font-black text-red-600 uppercase hover:underline"
                >
                  Refresh
                </button>
              </div>
              {formData.lat === 0 && !locating && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, lat: 23.8103, lng: 90.4125 }))}
                  className="text-[10px] font-bold text-blue-600 uppercase text-left hover:underline"
                >
                  Use Default Location (Dhaka) for Testing
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={locating}
              className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              Register as Donor
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 font-black hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
