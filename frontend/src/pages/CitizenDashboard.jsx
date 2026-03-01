import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { complaintAPI } from '../api';
import { Leaf, Clock, CheckCircle, AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CitizenDashboard = () => {
    const { user } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await complaintAPI.getMyComplaints();
                setComplaints(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error('Failed to fetch complaints', error);
                toast.error('Failed to load your complaints');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const stats = {
        total: (complaints || []).length,
        resolved: (complaints || []).filter(c => c.status === 'Resolved').length,
        pending: (complaints || []).filter(c => c.status === 'Pending').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome back, {user?.username}</h1>
                    <p className="text-gray-400 mt-1">Here's your waste management digest.</p>
                </div>
                <Link
                    to="/submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-medium flex items-center space-x-2"
                >
                    <span>Report Issue</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Total Reports</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="text-blue-500" size={24} />
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Resolved</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.resolved}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-emerald-500" size={24} />
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Eco Points</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-2">{user?.points || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                        <Leaf className="text-yellow-500" size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden mt-8">
                <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Recent Reports</h2>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center items-center flex-col space-y-4">
                        <Loader2 className="animate-spin text-emerald-500" size={40} />
                        <p className="text-gray-400 animate-pulse">Fetching your reports...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Leaf size={48} className="text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">You haven't reported any issues yet.</p>
                        <p className="text-gray-500 mt-2">Help keep Madurai clean by reporting waste hotspots.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {complaints.map((complaint) => (
                            <div key={complaint.id} className="p-6 hover:bg-gray-750 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start space-x-4">
                                    {complaint.image_url ? (
                                        <img
                                            src={`http://localhost:5000${complaint.image_url}`}
                                            alt="Complaint"
                                            className="w-20 h-20 rounded-lg object-cover border border-gray-600"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-lg bg-gray-700 flex items-center justify-center border border-gray-600">
                                            <MapPin size={24} className="text-gray-500" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{complaint.title || 'General Waste'}</h3>
                                        <p className="text-gray-400 text-sm mt-1 line-clamp-2 md:max-w-md">{complaint.description}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center"><Clock size={12} className="mr-1" /> {new Date(complaint.created_at).toLocaleDateString()}</span>
                                            <span className="bg-gray-700 px-2 py-1 rounded-md">Vulnerability: {Math.round(complaint.risk_score || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${complaint.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        complaint.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        {complaint.status}
                                    </span>

                                    {complaint.status === 'Resolved' && (
                                        <span className="text-emerald-500 text-xs font-medium mt-2 flex items-center">
                                            <CheckCircle size={12} className="mr-1" /> Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitizenDashboard;
