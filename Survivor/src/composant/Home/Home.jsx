import { useNavigate } from 'react-router-dom'; // Import du hook useNavigate
import './Home.scss';
import HomePhoto2 from '../../assets/Home_3.avif';
import HomePhoto3 from '../../assets/HomePhoto3.jpg';
import User from '../../assets/user.png';
import Pouce from '../../assets/pouce_icon.png';
import Comm from '../../assets/com_icon.png';
import Instagram from '../Instagram/Instagram';

function Home() {
  const navigate = useNavigate(); // Initialisation du hook useNavigate

  return (
    <div className="home-container">
      <div className='content-wrapper1'>

        <div className='text-column'>
          <h1 className='title-text'>JEB Incubator</h1>
          <p className='paragraph-text'>
            Uniting breakthrough ideas with global capital.<br />
            We fast-track early-stage startups by providing funding, expertise, and an unparalleled international network.
          </p>
          <div className='cta-button-container'>
            <button className="cta-button" onClick={() => navigate('/contactez-nous')}>
              DÉCOUVREZ-NOUS
            </button>
          </div>
        </div>
      </div>

      <div className='content-wrapper2'>
        <div className="slider">
            <div className="slide">
              <img src={HomePhoto2} alt="Image 1" className="home-image" />
            </div>
        </div>

        <div className='text-column2'>
          <div className='paragraph-text'>
            <h2 className='h2-text'>Our Mission</h2>
            <span className='color-text'>
              To cultivate a vibrant ecosystem where entrepreneurs thrive.<br />
              Through hands-on mentorship, strategic partnerships and seed investment up to £200k,
              we turn bold visions into scalable businesses.
            </span>
          </div>
          <div className='cta-button-container'>
            {/* <button className="cta-button2" onClick={() => navigate('/rendez-vous')}>
              Echangez gratuitement avec notre expert
            </button> */}
          </div>
        </div>
      </div>

      <div className='content-wrapper3'>
        <div className='text-column3'>
          <h2 className='title-text'>Notre Approche</h2>
          <p className='paragraph-text'>
            Vivez votre rêve en Thaïlande sans stress. Notre accompagnement personnalisé transforme votre expatriation en une aventure excitante,
            en vous aidant à surmonter les obstacles pour créer une nouvelle vie sur mesure dans ce paradis. Commencez un futur radieux, serein et bien entouré.
          </p>
        </div>

        <div className='box-container'>
          <div className='box'>
            <img src={User} alt="description de l'image" className='img1' />
            <p>Un Accompagnement 100% Personnalisé</p>
          </div>
          <div className='box'>
            <img src={Pouce} alt="description de l'image" className='img1' />
            <p>Des Ressources et Outils Pratiques</p>
          </div>
          <div className='box'>
            <img src={Comm} alt="description de l'image" className='img1' />
            <p>Une Communauté de Futurs Expatriés.</p>
          </div>
        </div>
      </div>

      <div className='back-style'>
        <div className='content-wrapper'>
          <img src={HomePhoto3} alt="Description de l'image" className="home-image-2" />
          <div className='text-column4'>
            <p className='paragraph-text'>
              Notre équipe se dévoue à faire de vos souhaits une réalité. Nos experts et notre équipe expérimentée sont toujours disponibles pour vous aider et répondre à toutes vos questions.
            </p>
            <p className='paragraph-text'>
              Nous consacrons notre temps à satisfaire les souhaits de nos clients et faisons tout notre possible pour que tout se déroule parfaitement. Vos besoins sont nos besoins !
            </p>
            <div className='cta-button-container'>
              <button className="cta-button3" onClick={() => navigate('/notre-offre')}>
                Découvrez notre offre ⏵
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='home-container'>
      <Instagram />      </div>
    </div>
  );
}

export default Home;
