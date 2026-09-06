'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function LogoutButton() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh(); // Forces the middleware to re-evaluate and clear cache
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loading}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all"
        >
            <LogOut className="w-4 h-4 mr-2" />
            {loading ? "Signing out..." : "Sign Out"}
        </Button>
    );
}