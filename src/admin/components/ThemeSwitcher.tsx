import { useThemes } from "../hooks/useThemeConfig";

export default function HeaderThemeSwitcher() {
    const { themes, selected, applyTheme } = useThemes();

    return (
        <div className="relative">
            <select
                title='Cambiar tema'
                value={selected?.id ?? ''}
                onChange={(e) => {
                    const theme = themes.find((t) => t.id.toString() === e.target.value);
                    if (theme) applyTheme(theme);
                }}
                className="bg-transparent text-sm border border-gray-300 rounded px-2 py-1"
            >
                {themes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                        🎨 {theme.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
