import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Theme {
    id: number;
    name: string;
    primary_color: string;
    secondary_color: string;
    background_color: string;
    accent_color: string;
}

export function useThemes() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selected, setSelected] = useState<Theme | null>(null);

    useEffect(() => {
        async function loadThemes() {
            const { data, error } = await supabase
                .from('theme_config')
                .select('*')
                .order('is_default', { ascending: false });
            if (error) {
                console.error('Error loading themes:', error);
                return;
            }

            setThemes(data);
            const storedId = localStorage.getItem('selected-theme-id');
            const found = data.find((t) => t.id.toString() === storedId) ?? data[0];
            setSelected(found);
        }

        loadThemes();
    }, []);

    function applyTheme(theme: Theme) {
        document.body.style.setProperty('--color-primary', theme.primary_color);
        document.body.style.setProperty('--color-secondary', theme.secondary_color);
        document.body.style.setProperty('--color-background', theme.background_color);
        document.body.style.setProperty('--color-accent', theme.accent_color);
        localStorage.setItem('selected-theme-id', theme.id.toString());
        setSelected(theme);
    }

    useEffect(() => {
        if (selected) applyTheme(selected);
    }, [selected]);

    return { themes, selected, applyTheme };
}
