import { useNavigate } from 'react-router-dom'; // Import du hook useNavigate
import './Home.scss';
import HomePhoto2 from '../../assets/Home_3.avif';
import HomePhoto3 from '../../assets/home_4.avif';
import Instagram from '../Instagram/Instagram';
import Engrenage from '../../assets/engrenage.svg';
import Diamond from '../../assets/diamond.svg';
import Photo_device from '../../assets/camera.svg';

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
          <h2 className='title-text'>What We Offer</h2>
          <p className='paragraph-text'>
            From product validation to market expansion, JEB provides the critical resources founders need at every stage of the journey.
          </p>
        </div>

        <div className='box-container'>
          <div className='box'>
            <img src={Engrenage} alt="description de l'image" className='img1' />
            <img src={Diamond} alt="description de l'image" className='img1' />
            <img src={Photo_device} alt="description de l'image" className='img1' />

          </div>
          <div className='box'>
            <img src={Engrenage} alt="description de l'image" className='img1' />
            <img src={Diamond} alt="description de l'image" className='img1' />
            <img src={Photo_device} alt="description de l'image" className='img1' />
          </div>
        </div>
      </div>

      <div className='back-style'>
        <div className='content-wrapper'>
          <img src={HomePhoto3} alt="Description de l'image" className="home-image-2" />
          <div className='text-column4'>
            <p className='paragraph-text'>
              Headquartered in London with hubs in New York, Singapore and Berlin, our alumni have raised over £500 M and created 3 000+ jobs worldwide.
            </p>
            <div className='cta-button-container'>
              <button className="cta-button3" onClick={() => navigate('/notre-offre')}>
                See our Projets Catalog ⏵
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
