import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  User as UserIcon, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Shield, 
  Ban, 
  Activity, 
  MapPin,
  Trash2
} from 'lucide-react';

interface Request {
  id: string;
  requester_id: string;
  donor_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  blood_group: string;
  role: string;
  is_banned: boolean;
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState({ total_users: 0, lives_saved: 0, total_donors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchAnalytics();
      if (user.email === 'mdmahadih673@gmail.com') {
        fetchAdminData();
      }
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/settings/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics');
    }
  };

  const updateAnalytics = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/settings/analytics', analytics);
      alert('Analytics updated successfully!');
    } catch (err) {
      alert('Failed to update analytics');
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`/api/requests/incoming/${user?.id}`);
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setAdminUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch admin data');
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      await axios.patch(`/api/requests/${requestId}`, { status });
      fetchRequests();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const adminBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/ban`, { isBanned });
      fetchAdminData();
    } catch (err) {
      alert('Failed to ban user');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 font-black text-3xl mb-6 border-4 border-white shadow-xl shadow-red-100">
                {user?.bloodGroup}
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">{user?.name}</h2>
              <p className="text-gray-500 text-sm mb-6">{user?.email}</p>
              <div className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                {user?.role}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-gray-700">Availability</span>
                </div>
                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">Last Donation: 4 months ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Incoming Requests */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Blood Requests</h2>
              </div>
              <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-widest">
                {requests.length} Total
              </span>
            </div>

            <div className="space-y-6">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <div key={req.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-8 hover:shadow-xl transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          Incoming
                        </span>
                        <span className="text-xs text-gray-400 font-bold">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-black text-xl text-gray-900 mb-2">From: {req.requester?.name}</h3>
                      <p className="text-gray-600 bg-gray-50 p-5 rounded-2xl italic border border-gray-100 mb-6">
                        "{req.message}"
                      </p>
                      
                      {req.status === 'accepted' && (
                        <div className="flex items-center gap-3 text-green-600 font-black text-lg bg-green-50 px-6 py-4 rounded-2xl w-fit border border-green-100">
                          <Phone className="w-6 h-6" />
                          {req.requester?.phone}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between min-w-[140px]">
                      <div className={`flex items-center gap-2 font-black text-xs uppercase tracking-widest ${
                        req.status === 'pending' ? 'text-orange-500' : 
                        req.status === 'accepted' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {req.status === 'pending' && <Clock className="w-4 h-4" />}
                        {req.status === 'accepted' && <CheckCircle className="w-4 h-4" />}
                        {req.status === 'rejected' && <XCircle className="w-4 h-4" />}
                        {req.status}
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'rejected')}
                            className="p-4 text-red-500 bg-red-50 hover:bg-red-100 rounded-2xl transition-all"
                            title="Reject"
                          >
                            <XCircle className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'accepted')}
                            className="p-4 text-green-500 bg-green-50 hover:bg-green-100 rounded-2xl transition-all"
                            title="Accept"
                          >
                            <CheckCircle className="w-6 h-6" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold italic">No requests received yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Admin Panel */}
          {user?.email === 'mdmahadih673@gmail.com' && (
            <section className="pt-12 border-t border-gray-100 space-y-12">
              {/* Analytics Settings */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Home Analytics Settings</h2>
                </div>
                
                <form onSubmit={updateAnalytics} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Total Users</label>
                    <input
                      type="number"
                      value={analytics.total_users || 0}
                      onChange={(e) => setAnalytics({ ...analytics, total_users: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Lives Saved</label>
                    <input
                      type="number"
                      value={analytics.lives_saved || 0}
                      onChange={(e) => setAnalytics({ ...analytics, lives_saved: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-red-600 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Total Donors</label>
                    <input
                      type="number"
                      value={analytics.total_donors || 0}
                      onChange={(e) => setAnalytics({ ...analytics, total_donors: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-green-600 outline-none font-bold"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all"
                    >
                      Save Analytics Data
                    </button>
                  </div>
                </form>
              </div>

              {/* User Management */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">User Management</h2>
                </div>

                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                  <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Blood</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminUsers.map((u) => (
                      <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.is_banned ? 'opacity-50 grayscale' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                              <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-black text-gray-900 text-sm">{u.name}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-black text-red-600">{u.blood_group}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{u.role}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-3">
                            <button
                              onClick={() => adminBanUser(u.id, !u.is_banned)}
                              className={`p-2.5 rounded-xl transition-all ${
                                u.is_banned ? 'text-green-500 bg-green-50 hover:bg-green-100' : 'text-orange-500 bg-orange-50 hover:bg-orange-100'
                              }`}
                              title={u.is_banned ? 'Unban' : 'Ban'}
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          )}
        </div>
      </div>
    </div>
  );
}
