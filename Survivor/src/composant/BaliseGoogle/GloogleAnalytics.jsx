import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        const trackPageView = () => {
            if (window.gtag) {
                window.gtag('config', 'G-JMKRKMFXZB', {
                    page_path: location.pathname,
                });
            }
        };

        // Attendre que le script de Google Analytics soit chargé
        if (!window.gtag) {
            const interval = setInterval(() => {
                if (window.gtag) {
                    clearInterval(interval);
                    trackPageView();
                }
            }, 100); // Vérifie toutes les 100 ms si GA est chargé
        } else {
            trackPageView();
        }
    }, [location]);

    return null;
};

export default GoogleAnalytics;
