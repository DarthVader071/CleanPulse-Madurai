import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Map, Leaf, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import React, { useState, useContext } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ email, password });
            toast.success('Successfully logged in!', { duration: 3000 });
            navigate('/dashboard'); // or admin dashboard depending on role
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to login', { duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f18] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center text-emerald-500 mb-2">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-sm shadow-xl shadow-emerald-500/5">
                        <Map size={40} className="animate-pulse" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-4xl font-black text-white tracking-tight">
                    CleanPulse <span className="text-emerald-500">Madurai</span>
                </h2>
                <p className="mt-3 text-center text-sm text-gray-400 font-medium max-w-xs mx-auto">
                    Empowering citizens through AI-powered waste intelligence and smart city logistics.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-[#161d27]/80 backdrop-blur-xl py-10 px-6 shadow-2xl shadow-emerald-900/20 sm:rounded-3xl sm:px-12 border border-gray-700/50">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 px-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-5 py-4 border border-gray-700/50 rounded-2xl bg-gray-900/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-gray-900 focus:border-transparent transition-all duration-300 ring-offset-gray-900"
                                    placeholder="citizen@madurai.gov.in"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 px-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-5 py-4 border border-gray-700/50 rounded-2xl bg-gray-900/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-gray-900 focus:border-transparent transition-all duration-300 ring-offset-gray-900"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-gray-700 rounded bg-gray-900"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400 font-medium">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                                    Forgot?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-emerald-500/10 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-all duration-200"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Shield size={18} className="mr-2" />}
                                {loading ? 'SIGNING IN...' : 'LOGIN TO DASHBOARD'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 text-center text-sm">
                        <span className="text-gray-500">New to the initiative?</span>{' '}
                        <Link to="/register" className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors ml-1">
                            Create Account
                        </Link>
                    </div>
                </div>

                {/* Technical Info */}
                <div className="mt-12 flex justify-center space-x-8">
                    <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                        <Leaf className="text-emerald-500 mb-1" size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Green City</span>
                    </div>
                    <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                        <Map className="text-emerald-500 mb-1" size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">AI Routing</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
