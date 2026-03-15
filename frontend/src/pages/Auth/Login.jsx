import { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await login(email, password);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.detail || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'An unexpected error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="card w-full max-w-md p-8 space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary-light/10 text-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-slate-500">Enter your credentials to access your tracker</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-2">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Mail size={14} /> Email Address
                        </label>
                        <input 
                            required 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com" 
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Lock size={14} /> Password
                        </label>
                        <input 
                            required 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full py-3 bg-primary-light text-white rounded-xl font-semibold shadow-lg shadow-primary-light/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <div className="text-center text-sm text-slate-500">
                    Don't have an account? {' '}
                    <Link to="/register" className="text-primary-light font-semibold hover:underline">Create one now</Link>
                </div>
            </div>
        </div>
    );
}
