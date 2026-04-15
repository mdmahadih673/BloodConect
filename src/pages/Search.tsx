import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DonorMap from '../components/DonorMap';
import { Search as SearchIcon, Filter, Map as MapIcon, List as ListIcon, Droplets, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Donor {
  id: string;
  name: string;
  blood_group: string;
  area: string;
  availability: boolean;
  last_donation_date: string;
  dist_meters: number;
}

export default function Search() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [bloodGroup, setBloodGroup] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [userLoc, setUserLoc] = useState<[number, number]>([23.8103, 90.4125]); // Default Dhaka
  const { user } = useAuth();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  useEffect(() => {
    handleSearch();
  }, [bloodGroup, userLoc]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/donors/search', {
        params: {
          bloodGroup,
          area,
          lat: userLoc[0],
          lng: userLoc[1],
          radius: 50000 // 50km
        }
      });
      setDonors(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (donorId: string) => {
    if (!user) {
      alert('Please login to send a request');
      return;
    }
    const message = prompt('Enter a message for the donor:');
    if (!message) return;

    try {
      await axios.post('/api/requests', {
        requesterId: user.id,
        donorId,
        message
      });
      alert('Request sent successfully!');
    } catch (err) {
      alert('Failed to send request');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Find Donors</h1>
          <p className="text-gray-500">Showing donors near your location</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${view === 'map' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <MapIcon className="w-4 h-4" />
            Map View
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${view === 'list' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <ListIcon className="w-4 h-4" />
            List View
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Blood Group</label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-red-600 outline-none font-bold"
          >
            <option value="">All Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Area / City</label>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              onBlur={handleSearch}
              placeholder="Search by area..."
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[600px]">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-white rounded-3xl border border-gray-100">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-bold text-gray-500">Searching for donors...</p>
            </div>
          </div>
        ) : view === 'map' ? (
          <DonorMap donors={donors} center={userLoc} onSendRequest={handleSendRequest} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto h-full pr-2">
            {donors.length > 0 ? (
              donors.map((donor) => (
                <div key={donor.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-black text-xl">
                      {donor.blood_group}
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${donor.availability ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                        {donor.availability ? 'Available' : 'Busy'}
                      </span>
                      <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                        {(donor.dist_meters / 1000).toFixed(1)}km away
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-900 mb-2">{donor.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {donor.area}
                  </p>

                  <button
                    onClick={() => handleSendRequest(donor.id)}
                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Droplets className="w-5 h-5" />
                    Request Blood
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <SearchIcon className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">No donors found in this area.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
