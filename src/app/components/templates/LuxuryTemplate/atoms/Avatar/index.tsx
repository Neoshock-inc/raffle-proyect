import { Crown } from "lucide-react";

// components/templates/LuxuryTemplate/atoms/Avatar/index.tsx
interface LuxuryAvatarProps {
    src: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    showCrown?: boolean;
}

export const LuxuryAvatar: React.FC<LuxuryAvatarProps> = ({
    src,
    alt,
    size = 'md',
    showCrown = false
}) => {
    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    };

    return (
        <div className="relative">
            <img
                src={src}
                alt={alt}
                className={`${sizeClasses[size]} rounded-full object-cover border-4 border-amber-300 shadow-lg`}
            />
            {showCrown && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-1 rounded-full">
                    <Crown className="w-4 h-4" />
                </div>
            )}
        </div>
    );
};