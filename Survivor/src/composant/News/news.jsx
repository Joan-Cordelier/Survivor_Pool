import { useState, useEffect } from 'react';
import './news.scss';
//import Video from '../../assets/Video-cont_gratuite .mov'; // Assure-toi que le chemin vers la vidéo est correct

function News() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Affiche le pop-up automatiquement lorsque la page se charge
    setShowPopup(true);
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false); // Ferme le pop-up lorsque l'utilisateur soumet le formulaire
  };

  return (
    <div className="content-container">
      <div className="content-video">
        {/* <video width="600" controls className='video'>
          <source src={Video} type="video/mp4" />
        </video> */}
      </div>
    </div>
  );
}

export default News;
