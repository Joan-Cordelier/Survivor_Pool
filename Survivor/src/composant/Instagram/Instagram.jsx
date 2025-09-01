import { useEffect } from 'react';
import './instagram.scss'; // Importer le fichier SCSS

const SnapWidget = () => {
  useEffect(() => {
    // Charger le script SnapWidget de manière dynamique dans le document
    const script = document.createElement('script');
    script.src = 'https://snapwidget.com/js/snapwidget.js';
    script.async = true;
    document.body.appendChild(script);

    // Nettoyage du script lorsqu'il n'est plus nécessaire
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="widget-container">
      <iframe 
        src="https://snapwidget.com/embed/1080385" 
        className="snapwidget-widget"
        title="Posts from Instagram"
        width="100%"  // Assurez-vous que le style est correct
        height="600"  // Hauteur ajustable selon vos besoins
        style={{ border: 'none' }}  // Supprime les bordures pour un rendu propre
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default SnapWidget;
