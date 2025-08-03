export const generateOrderNumber = async (): Promise<string> => {
    try {
        const response = await fetch('/api/generate-order-number', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to generate order number');
        }

        const { orderNumber } = await response.json();
        return orderNumber;
    } catch (error) {
        console.error('Error generating order number:', error);
        throw error;
    }
};