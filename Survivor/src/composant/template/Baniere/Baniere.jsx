import './Baniere.scss';
import Benoit from '../../../assets/benoit_ban.jpg';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate

function Baniere() {
  const navigate = useNavigate(); // Hook pour rediriger

  const handleClick = () => {
    navigate('/contenu-gratuit'); // Rediriger vers la page de contenu gratuit
  };

  return (
    <div className="banner-container" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="banner-section section-one">
        <h1>Demain Thaïlande</h1>
      </div>
      <div className="banner-section section-two">
        <h2>Découvrez nos contenus gratuits</h2>
      </div>
      <div className="banner-section section-three">
        <img src={Benoit} alt="description de l'image" className="banner-image" />
      </div>
    </div>
  );
};

export default Baniere;
