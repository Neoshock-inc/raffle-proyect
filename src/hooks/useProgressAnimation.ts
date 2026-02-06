import { useState, useEffect } from 'react';

export const useProgressAnimation = (targetPercentage: number, loading: boolean) => {
    const [animatedPercentage, setAnimatedPercentage] = useState(0);

    useEffect(() => {
        if (!loading && targetPercentage > 0) {
            const startValue = animatedPercentage;
            const endValue = targetPercentage;
            const duration = 1500;
            const startTime = Date.now();

            const animateProgressBar = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;

                if (elapsed < duration) {
                    const progress = elapsed / duration;
                    const easedProgress = progress < 0.5
                        ? 2 * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                    const newValue = startValue + (endValue - startValue) * easedProgress;
                    setAnimatedPercentage(newValue);
                    requestAnimationFrame(animateProgressBar);
                } else {
                    setAnimatedPercentage(endValue);
                }
            };

            requestAnimationFrame(animateProgressBar);
        }
    }, [loading, targetPercentage]);

    return animatedPercentage;
};