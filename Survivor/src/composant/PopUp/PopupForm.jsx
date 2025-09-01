import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './PopupForm.scss';
import { db } from '../../Firebase/firebase.js'; // Chemin vers votre fichier firebase.js
import { doc, setDoc } from 'firebase/firestore';

function PopupForm({ showPopup, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Stocker les informations dans Firebase Firestore
      await setDoc(doc(db, "users", email), {
        name: name,
        email: email
      });
      console.log("User info stored successfully");

      onClose(); // Fermer le popup après soumission
    } catch (error) {
      console.error("Error storing user info:", error);
    }
  };

  const handleClose = () => {
    navigate('/'); // Rediriger vers la page d'accueil
  };

  if (!showPopup) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button onClick={handleClose} className="close-btn">X</button>
        <h2 className='title-style'>Entrez vos informations pour voir la vidéo gratuite</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Prénom:
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </label>
          <label>
            Email:
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </label>
          <div className="button-group">
            <button type="submit">Envoyer</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PopupForm;
