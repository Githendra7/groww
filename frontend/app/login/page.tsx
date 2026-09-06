'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';

export default function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        let authError = null;

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            authError = error;
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            authError = error;
        }

        if (authError) {
            setErrorMsg(authError.message);
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50">

            {/* LEFT PANEL: Branding & Aesthetics (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden">
                {/* Abstract background glow */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-emerald-400 mb-12">
                        <TrendingUp className="h-8 w-8" />
                        <span className="text-2xl font-bold text-white tracking-tight">SmartWatch</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight mt-12 mb-6">
                        Track what <span className="text-emerald-400">meaningfully</span> changed.
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                        Standard watchlists just show numbers. We provide context. Catch up on price action, volume anomalies, and technical breakouts instantly.
                    </p>
                </div>

                <div className="relative z-10 flex gap-6 mt-12">
                    <div className="flex flex-col gap-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                        <Activity className="h-6 w-6 text-emerald-400" />
                        <span className="text-white font-medium">Real-time Data</span>
                    </div>
                    <div className="flex flex-col gap-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                        <BarChart3 className="h-6 w-6 text-blue-400" />
                        <span className="text-white font-medium">Smart Context</span>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Authentication Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            {isSignUp ? 'Create your account' : 'Welcome back'}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {isSignUp
                                ? 'Enter your details to get started with your smart watchlist.'
                                : 'Enter your credentials to access your smart watchlist.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="flex flex-col gap-4">

                        {errorMsg && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium animate-in fade-in slide-in-from-top-2">
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                                required
                            />
                        </div>

                        <div className="space-y-1 mb-2">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                        >
                            {loading
                                ? "Processing..."
                                : (isSignUp ? "Sign Up" : "Sign In")}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setErrorMsg('');
                            }}
                            className="ml-2 font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                            {isSignUp ? "Sign In" : "Create one"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}