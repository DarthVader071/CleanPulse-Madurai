import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { complaintAPI, routeAPI } from '../api';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, AlertTriangle, CheckCircle, Clock, Filter, Loader2, Layers, BarChart3, Activity, Route } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import HeatmapLayer from '../components/HeatmapLayer';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [wasteFilter, setWasteFilter] = useState('All');
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [optimizedRoute, setOptimizedRoute] = useState(null);
    const [routingLoading, setRoutingLoading] = useState(false);

    // If not admin, redirect
    if (user && user.role !== 'Admin' && user.role !== 'Worker') {
        return <Navigate to="/dashboard" />;
    }

    const maduraiCenter = [9.9252, 78.1198];

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await complaintAPI.getAll();
                setComplaints(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error('Failed to fetch all complaints', error);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const handleGenerateRoute = async () => {
        setRoutingLoading(true);
        try {
            const highRisk = complaints.filter(c => (c.risk_score || 0) > 75 && c.status !== 'Resolved');
            if (highRisk.length === 0) {
                toast.error('No high-risk pending complaints to route.');
                setRoutingLoading(false);
                return;
            }

            const payload = {
                start: { id: 'depot', lat: maduraiCenter[0], lng: maduraiCenter[1] },
                complaints: highRisk.map(c => ({
                    id: c.id,
                    lat: c.location_lat,
                    lng: c.location_lng
                }))
            };

            const res = await routeAPI.optimize(payload);
            setOptimizedRoute(res.data.optimized_route);
            setShowHeatmap(false);
            toast.success('Optimal route generated successfully!');
        } catch (error) {
            console.error('Routing failed', error);
            toast.error('Failed to generate route. Ensure the route service is running.');
        } finally {
            setRoutingLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await complaintAPI.updateStatus(id, newStatus);
            setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status', error);
            toast.error('Error updating status');
        }
    };

    const filteredComplaints = (complaints || []).filter(c => {
        const statusMatch = filter === 'All' || c.status === filter;
        const wasteMatch = wasteFilter === 'All' || c.waste_type === wasteFilter;
        return statusMatch && wasteMatch;
    });

    const stats = {
        total: (complaints || []).length,
        pending: (complaints || []).filter(c => c.status === 'Pending').length,
        resolved: (complaints || []).filter(c => c.status === 'Resolved').length,
        inProgress: (complaints || []).filter(c => c.status === 'In Progress').length,
        highRisk: (complaints || []).filter(c => (c.risk_score || 0) > 75).length,
        mediumRisk: (complaints || []).filter(c => (c.risk_score || 0) > 40 && (c.risk_score || 0) <= 75).length,
        lowRisk: (complaints || []).filter(c => (c.risk_score || 0) <= 40).length,
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">City Control Center</h1>
                    <p className="text-gray-400 mt-1">Real-time waste intelligence and tracking.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleGenerateRoute}
                        disabled={routingLoading}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-colors text-sm font-medium ${optimizedRoute ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-750'
                            }`}
                    >
                        {routingLoading ? <Loader2 className="animate-spin" size={16} /> : <Route size={16} />}
                        <span>{optimizedRoute ? 'Route Active' : 'Optimize Route'}</span>
                    </button>
                    <button
                        onClick={() => {
                            setShowHeatmap(!showHeatmap);
                            if (!showHeatmap) setOptimizedRoute(null);
                        }}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-colors text-sm font-medium ${showHeatmap
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-750'
                            }`}
                    >
                        <Layers size={16} />
                        <span>{showHeatmap ? 'Heatmap Active' : 'Show Heatmap'}</span>
                    </button>
                    <div className="flex items-center space-x-2 bg-gray-800 rounded-xl p-1 border border-gray-700">
                        <Filter size={16} className="text-gray-400 ml-2" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent text-sm text-white px-2 py-1 outline-none cursor-pointer"
                        >
                            <option value="All" className="bg-gray-900 text-white">All Statuses</option>
                            <option value="Pending" className="bg-gray-900 text-white">Pending</option>
                            <option value="In Progress" className="bg-gray-900 text-white">In Progress</option>
                            <option value="Resolved" className="bg-gray-900 text-white">Resolved</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-800 rounded-xl p-1 border border-gray-700">
                        <Filter size={16} className="text-gray-400 ml-2" />
                        <select
                            value={wasteFilter}
                            onChange={(e) => setWasteFilter(e.target.value)}
                            className="bg-transparent text-sm text-white px-2 py-1 outline-none cursor-pointer"
                        >
                            <option value="All" className="bg-gray-900 text-white">All Waste Types</option>
                            <option value="General" className="bg-gray-900 text-white">General</option>
                            <option value="Organic (Food/Green)" className="bg-gray-900 text-white">Organic</option>
                            <option value="Plastic" className="bg-gray-900 text-white">Plastic</option>
                            <option value="Paper/Cardboard" className="bg-gray-900 text-white">Paper</option>
                            <option value="Metal" className="bg-gray-900 text-white">Metal</option>
                            <option value="Electronic (E-waste)" className="bg-gray-900 text-white">Electronic</option>
                            <option value="Medical/Hazardous" className="bg-gray-900 text-white">Medical/Hazardous</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Analytics Dashboard Panel */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="text-emerald-500" size={20} />
                    <h2 className="text-lg font-bold text-white">System Analytics</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-white">{stats.total}</span>
                        <span className="text-xs text-gray-400 font-medium uppercase mt-1">Total Reports</span>
                    </div>

                    <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500/20 rounded-full p-4"><Activity size={24} className="text-red-500 opacity-20" /></div>
                        <span className="text-3xl font-black text-red-500 relative z-10">{stats.highRisk}</span>
                        <span className="text-xs text-red-400 font-medium uppercase mt-1 relative z-10">High Risk</span>
                    </div>

                    <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <span className="text-3xl font-black text-amber-500 relative z-10">{stats.mediumRisk}</span>
                        <span className="text-xs text-amber-400 font-medium uppercase mt-1 relative z-10">Medium Risk</span>
                    </div>

                    <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <span className="text-3xl font-black text-emerald-500 relative z-10">{stats.lowRisk}</span>
                        <span className="text-xs text-emerald-400 font-medium uppercase mt-1 relative z-10">Low Risk</span>
                    </div>

                    <div className="col-span-2 md:col-span-1 bg-gray-900/50 p-3 rounded-xl border border-gray-700/50 flex flex-col justify-center space-y-2">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-xs text-gray-400 uppercase font-medium">Resolved</span>
                            <span className="font-bold text-emerald-400">{stats.resolved}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center px-2 pt-1 border-t border-gray-800">
                            <span className="text-xs text-gray-400 uppercase font-medium">Pending/Prog</span>
                            <span className="font-bold text-yellow-500">{stats.pending + stats.inProgress}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* Map View */}
                <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden relative">
                    <MapContainer
                        center={maduraiCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0 relative"
                    >
                        <TileLayer
                            attribution='&copy; OSM'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {optimizedRoute && (
                            <>
                                <Polyline
                                    positions={[[maduraiCenter[0], maduraiCenter[1]], ...optimizedRoute.map(p => [p.lat, p.lng])]}
                                    color="#3b82f6"
                                    weight={4}
                                    dashArray="5, 10"
                                    opacity={0.8}
                                />
                                <CircleMarker center={maduraiCenter} radius={8} pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1 }}>
                                    <Popup><strong>Depot (Start)</strong></Popup>
                                </CircleMarker>
                            </>
                        )}
                        {showHeatmap ? (
                            <HeatmapLayer points={filteredComplaints} />
                        ) : (
                            filteredComplaints.map(complaint => (
                                <Marker
                                    key={complaint.id}
                                    position={[complaint.location_lat, complaint.location_lng]}
                                >
                                    <Popup className="custom-popup">
                                        <div className="text-sm p-1">
                                            <p className="font-bold border-b pb-1 mb-1">{complaint.title || 'Waste Site'}</p>
                                            <p className="text-gray-400 truncate max-w-[150px] mb-2">{complaint.description}</p>
                                            <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                                                <span className="text-xs font-bold text-gray-300">{complaint.status}</span>
                                                <span className="text-xs text-red-400 font-bold ml-2">Risk: {Math.round(complaint.risk_score || 0)}</span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))
                        )}
                    </MapContainer>
                    <style>{`
            .leaflet-popup-content-wrapper { background: #ffffff; color: #111827; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            .leaflet-popup-tip { background: #ffffff; }
          `}</style>
                </div>

                {/* Complaints List Panel */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-y-auto flex flex-col">
                    <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            <Map size={18} className="mr-2 text-emerald-500" />
                            Live Feed
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 size={32} className="animate-spin text-emerald-500" />
                            </div>
                        ) : filteredComplaints.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">No reports match the current filter.</div>
                        ) : (
                            filteredComplaints.map(complaint => (
                                <div key={complaint.id} className="bg-gray-900 border border-gray-700 p-4 rounded-xl hover:border-gray-600 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex space-x-2">
                                            <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wide ${(complaint.risk_score || 0) > 75 ? 'bg-red-500/20 text-red-500' :
                                                (complaint.risk_score || 0) > 40 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500'
                                                }`}>
                                                Risk: {Math.round(complaint.risk_score || 0)}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {complaint.waste_type || 'General'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <Clock size={10} className="mr-1" />
                                            {new Date(complaint.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex space-x-4 mb-4">
                                        {complaint.image_url && (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700">
                                                <img
                                                    src={`http://localhost:5000${complaint.image_url}`}
                                                    alt="Evidence"
                                                    className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                                    onClick={() => window.open(`http://localhost:5000${complaint.image_url}`, '_blank')}
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-300 line-clamp-2">{complaint.description}</p>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">By: {complaint.username || 'Anonymous'}</span>

                                        <select
                                            value={complaint.status}
                                            onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                                            className={`text-xs font-semibold px-2 py-1 rounded-md outline-none cursor-pointer border ${complaint.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                complaint.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}
                                        >
                                            <option value="Pending" className="bg-gray-900 text-white">Pending</option>
                                            <option value="In Progress" className="bg-gray-900 text-white">In Progress</option>
                                            <option value="Resolved" className="bg-gray-900 text-white">Resolved</option>
                                        </select>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
