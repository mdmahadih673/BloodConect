import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Shield, MapPin, Droplets, Users, Activity, Star } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import AnimatedCounter from '../components/AnimatedCounter';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Blood Icon for Map
const bloodIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #e63946; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><div style="transform: rotate(45deg); color: white; font-weight: 900; font-size: 10px;">B+</div></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

export default function Home() {
  const [analytics, setAnalytics] = useState({ total_users: 0, lives_saved: 0, total_donors: 0 });
  const [userLocations, setUserLocations] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchUserLocations();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/settings/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics');
    }
  };

  const fetchUserLocations = async () => {
    try {
      const res = await axios.get('/api/users/locations');
      setUserLocations(res.data);
    } catch (err) {
      console.error('Failed to fetch user locations');
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-bold mb-8"
            >
              <Heart className="w-4 h-4 fill-current" />
              Save Lives Today
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tight"
            >
              Find Blood Donors <br />
              <span className="text-red-600">Near Your Location</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-12 leading-relaxed"
            >
              BloodConnect uses real-time geolocation to find the nearest eligible donors. 
              Fast, secure, and privacy-focused blood donation network.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/search"
                className="w-full sm:w-auto px-10 py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-2xl shadow-red-200 flex items-center justify-center gap-3"
              >
                <Search className="w-6 h-6" />
                Find Donors Now
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3"
              >
                <Users className="w-6 h-6" />
                Register as Donor
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedCounter 
              value={analytics.total_users} 
              title="Total Users" 
              icon={Users} 
              color="bg-blue-50 text-blue-600" 
            />
            <AnimatedCounter 
              value={analytics.lives_saved} 
              title="Lives Saved" 
              icon={Heart} 
              color="bg-red-50 text-red-600" 
            />
            <AnimatedCounter 
              value={analytics.total_donors} 
              title="Total Donors" 
              icon={Droplets} 
              color="bg-green-50 text-green-600" 
            />
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Our Network Across Bangladesh</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Real-time visualization of our blood donor community. Click on the icons to see donors in that area.
            </p>
          </div>
          
          <div className="h-[600px] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
            <MapContainer center={[23.8103, 90.4125]} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {userLocations.map((u) => {
                // Mocking coordinates for demo if location is not parsed correctly
                const lat = 23.8103 + (Math.random() - 0.5) * 4;
                const lng = 90.4125 + (Math.random() - 0.5) * 4;
                
                return (
                  <Marker 
                    key={u.id} 
                    position={[lat, lng]} 
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: #e63946; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><div style="transform: rotate(45deg); color: white; font-weight: 900; font-size: 10px;">${u.blood_group}</div></div>`,
                      iconSize: [30, 30],
                      iconAnchor: [15, 30]
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="font-black text-gray-900">{u.name}</div>
                        <div className="text-xs text-red-600 font-bold uppercase tracking-widest">{u.blood_group} Donor</div>
                        <div className="text-[10px] text-gray-400 mt-1">{u.area}</div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-8 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Location Based</h3>
              <p className="text-gray-600 leading-relaxed">
                Find donors sorted by their exact distance from your current location using PostGIS technology.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">
                Donor phone numbers are hidden until they explicitly accept your blood request.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-8 group-hover:scale-110 transition-transform">
                <Droplets className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Eligible Donors</h3>
              <p className="text-gray-600 leading-relaxed">
                Our system automatically checks donation eligibility based on the 90-day recovery rule.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
