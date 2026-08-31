export const trackVisit = async () => {
    try {
        const response = await fetch('/api/analytics/visit', {
            method: 'POST',
        });

        const data = await response.json();

        console.log('Visitor number:', data.visitorNumber);
    } catch (error) {
        console.error('Visitor tracking failed:', error);
    }
};