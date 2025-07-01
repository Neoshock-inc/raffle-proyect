import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const useReferralCode = () => {
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (typeof ref === 'string' && ref) {
            setReferralCode(ref);
        }
    }, [searchParams]);

    return referralCode;
};