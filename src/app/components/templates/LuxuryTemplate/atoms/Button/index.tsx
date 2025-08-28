// components/templates/LuxuryTemplate/atoms/Button/index.tsx
interface LuxuryButtonProps {
    variant?: 'primary' | 'secondary' | 'white';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export const LuxuryButton: React.FC<LuxuryButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    icon,
    ...props
}) => {
    const baseClasses = "font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3";

    const variantClasses = {
        primary: "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700",
        secondary: "bg-gradient-to-r from-purple-600 via-pink-500 to-red-600 text-white",
        white: "bg-white text-amber-700 hover:bg-amber-50 border-4 border-amber-300"
    };

    const sizeClasses = {
        sm: "py-2 px-4 text-sm",
        md: "py-3 px-8 text-base",
        lg: "py-4 px-6 text-lg",
        xl: "py-6 px-16 text-2xl"
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
            {...props}
        >
            {icon}
            <span>{children}</span>
        </button>
    );
};