import { useState, useEffect } from 'react';
import './Cont.scss';
import PopupForm from '../PopUp/PopupForm.jsx'; // Assure-toi que le chemin est correct
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
      <PopupForm showPopup={showPopup} onClose={handleClosePopup} />
      <div className="content-video">
        {/* <video width="600" controls className='video'>
          <source src={Video} type="video/mp4" />
        </video> */}
      </div>
    </div>
  );
}

export default News;
