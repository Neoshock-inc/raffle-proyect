export const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculateTimeRemaining = (expTimestamp: number): number => {
    const now = Date.now();
    const expirationTime = expTimestamp * 1000;
    return Math.max(0, Math.floor((expirationTime - now) / 1000));
};