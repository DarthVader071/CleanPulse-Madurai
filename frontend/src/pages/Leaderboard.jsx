import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../api';
import { Trophy, Medal, Star, Award, TrendingUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await leaderboardAPI.getTopCitizens();
                setLeaders(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error('Failed to load leaderboard', error);
                toast.error('Failed to load leaderboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400" size={28} />;
            case 1: return <Medal className="text-gray-300" size={28} />;
            case 2: return <Medal className="text-amber-600" size={28} />;
            default: return <span className="text-gray-500 font-bold text-lg w-7 text-center">{index + 1}</span>;
        }
    };

    const getRankStyle = (index) => {
        switch (index) {
            case 0: return 'bg-yellow-500/10 border-yellow-500/50 shadow-yellow-500/20';
            case 1: return 'bg-gray-400/10 border-gray-400/50 shadow-gray-400/20';
            case 2: return 'bg-amber-600/10 border-amber-600/50 shadow-amber-600/20';
            default: return 'bg-gray-800 border-gray-700 hover:bg-gray-750';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-full mb-4 ring-1 ring-emerald-500/30">
                    <Award className="text-emerald-500" size={32} />
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Eco Champions</h1>
                <p className="text-gray-400 mt-3 max-w-xl mx-auto">
                    Recognizing the top citizens of Madurai who are making a difference in keeping our city clean and green.
                </p>
            </div>

            <div className="bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-gray-700 bg-gray-800 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>

                    <div className="md:col-span-2 flex flex-col justify-center relative z-10">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <TrendingUp className="mr-2 text-emerald-500" size={24} />
                            This Month's Impact
                        </h2>
                        <p className="text-gray-400 text-sm mt-2 max-w-md">
                            Earn Eco Points by reporting waste hotspots and helping authorities resolve them faster.
                            The top 3 citizens get featured in the Madurai Corporation monthly digital bulletin!
                        </p>
                    </div>

                    <div className="mt-6 md:mt-0 flex items-center justify-center md:justify-end relative z-10">
                        <div className="text-center bg-gray-900 border border-gray-700 px-6 py-4 rounded-2xl shadow-inner">
                            <span className="block text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">Total Points Awarded</span>
                            <span className="text-3xl font-extrabold text-white">
                                {(leaders || []).reduce((acc, user) => acc + (user.points || 0), 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="animate-spin text-emerald-500" size={40} />
                            <p className="text-gray-400 animate-pulse">Loading champions...</p>
                        </div>
                    ) : leaders.length === 0 ? (
                        <div className="text-center py-16">
                            <Star className="mx-auto text-gray-600 mb-4" size={48} />
                            <p className="text-xl text-gray-400 font-medium">No points awarded yet.</p>
                            <p className="text-gray-500 mt-2">Be the first to score by reporting an issue!</p>
                        </div>
                    ) : (
                        <div className="space-y-4 relative">

                            {/* Leaderboard Header Row */}
                            <div className="hidden md:flex px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="w-16 text-center">Rank</div>
                                <div className="flex-1">Citizen</div>
                                <div className="w-32 text-right">Reports</div>
                                <div className="w-32 text-right text-emerald-500">Eco Points</div>
                            </div>

                            {leaders.map((user, index) => (
                                <div
                                    key={user.id}
                                    className={`flex items-center px-4 md:px-6 py-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${getRankStyle(index)}`}
                                >
                                    <div className="w-12 md:w-16 flex justify-center items-center">
                                        {getRankIcon(index)}
                                    </div>

                                    <div className="flex-1 flex items-center min-w-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0 shadow-inner ${index === 0 ? 'bg-yellow-500 text-yellow-900' :
                                            index === 1 ? 'bg-gray-300 text-gray-800' :
                                                index === 2 ? 'bg-amber-600 text-amber-100' :
                                                    'bg-gray-700 text-gray-300'
                                            }`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="truncate pr-4">
                                            <p className={`font-bold truncate ${index < 3 ? 'text-white text-lg' : 'text-gray-200'}`}>
                                                {user.username}
                                                {index === 0 && <span className="ml-2 inline-block px-2 text-[10px] bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 align-middle mb-1">MVP</span>}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate md:hidden mt-0.5">
                                                {user.points || 0} pts
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-32 text-right hidden md:block">
                                        <span className="text-gray-400 font-medium">{user.complaintsCount || 0}</span>
                                    </div>

                                    <div className="w-32 text-right hidden md:block">
                                        <span className="text-xl font-black text-emerald-400">{user.points || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
