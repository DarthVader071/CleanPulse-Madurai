import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Upload, MapPin, X, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const SubmitComplaint = () => {
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Madurai coordinates
    const maduraiCenter = [9.9252, 78.1198];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !position) {
            toast.error('Please provide a description and select a location on the map.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', 'Waste Hotspot');
        formData.append('description', description);
        formData.append('location_lat', position.lat);
        formData.append('location_lng', position.lng);
        if (image) {
            formData.append('image_url', image);
        }

        try {
            await complaintAPI.create(formData);
            toast.success('Complaint submitted successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Report Waste Hotspot</h1>
                <p className="text-gray-400 mt-1">Help us identify areas that need attention.</p>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Form Section */}
                    <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-700">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    placeholder="Describe the waste issue, landmarks nearby..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Photo Evidence
                                </label>

                                {preview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-gray-600 group">
                                        <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-gray-900/80 p-1.5 rounded-full text-white hover:bg-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-600 rounded-xl h-48 flex flex-col items-center justify-center bg-gray-900/50 hover:bg-gray-800 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                                            <Upload className="text-gray-400 group-hover:text-emerald-500 transition-colors" size={24} />
                                        </div>
                                        <span className="text-gray-400 font-medium">Click to upload photo</span>
                                        <span className="text-gray-500 text-sm mt-1">PNG, JPG up to 5MB</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <div className="md:hidden">
                                <p className="text-sm font-medium text-gray-300 mb-2">Location Required</p>
                                <p className="text-xs text-gray-500">Please select a location on the map below.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg transition-all duration-200 font-medium ${loading ? 'bg-emerald-600/50 cursor-not-allowed text-white/70' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Report'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Map Section */}
                    <div className="relative h-64 md:h-auto min-h-[300px] bg-gray-900">
                        <div className="absolute top-4 left-4 z-[1000] bg-gray-900/90 backdrop-blur pb-1 pt-2 px-3 rounded-lg border border-gray-700 shadow-xl pointer-events-none">
                            <p className="text-xs font-semibold text-emerald-400 flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {position ? 'Location Selected' : 'Click map to pin location'}
                            </p>
                        </div>

                        <MapContainer
                            center={maduraiCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                className="map-tiles"
                            />
                            <LocationMarker position={position} setPosition={setPosition} />
                        </MapContainer>

                        <style>{`
              .map-tiles { filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7); }
              .leaflet-container { background: #111827; }
            `}</style>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SubmitComplaint;
