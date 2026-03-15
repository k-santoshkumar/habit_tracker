import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, Check } from 'lucide-react';

export default function Register() {
    const [form, setForm] = useState({ email: '', password: '', full_name: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Frontend email validation
        const emailRegex = /^[a-z0-9](-?[a-z0-9._%+-])*@[a-z0-9](-?[a-z0-9])*\.[a-z]{2,10}$/;
        if (!emailRegex.test(form.email.toLowerCase())) {
            setError('Please enter a valid email address.');
            return;
        }

        const domain = form.email.split('@')[1];
        const disposable = ["mailinator.com", "tempmail.com", "yopmail.com"];
        if (disposable.includes(domain)) {
            setError('Please use a non-disposable email provider like @gmail.com.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await register(form);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.detail || 'Registration failed.');
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
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
                    <p className="text-sm text-slate-500">Join us to start tracking your health habits</p>
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
                            <User size={14} /> Full Name
                        </label>
                        <input 
                            required 
                            type="text" 
                            value={form.full_name}
                            onChange={(e) => setForm({...form, full_name: e.target.value})}
                            placeholder="John Doe" 
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Mail size={14} /> Email Address
                        </label>
                        <input 
                            required 
                            type="email" 
                            value={form.email}
                            onChange={(e) => setForm({...form, email: e.target.value})}
                            placeholder="name@gmail.com" 
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" 
                        />
                        <p className="text-[10px] text-slate-400">Preferably @gmail.com for better verification</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Lock size={14} /> Password
                        </label>
                        <input 
                            required 
                            type="password" 
                            value={form.password}
                            onChange={(e) => setForm({...form, password: e.target.value})}
                            placeholder="Min 8 characters" 
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full py-3 bg-primary-light text-white rounded-xl font-semibold shadow-lg shadow-primary-light/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Get Started'}
                    </button>
                </form>

                <div className="text-center text-sm text-slate-500">
                    Already have an account? {' '}
                    <Link to="/login" className="text-primary-light font-semibold hover:underline">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
