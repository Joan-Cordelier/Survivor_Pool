import { useState } from 'react';
import './Contact.scss'; // Importe le fichier SCSS
import Calendar from '../../assets/calendar.svg';
import Ringing from '../../assets/bell.svg';
import Pencil from '../../assets/pen.svg';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const mailtoLink = `mailto:${formData.email}?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(formData.message)}`;

    window.location.href = mailtoLink;
  };

  return (
    <div className="contact-container">
      <div className="contact-left">
        <video width="600" controls className='video'>
                <source src= {Video} type="video/mp4" />
        </video>
        <h2>Qui sommes-nous?</h2>
        <ul className="info-list">
          <div className="info-item-container">
            <div className='image-container'>
              <img src={Pencil} alt="description de l'image" className='img2' />
            </div>
            <li className="info-item">
              <div className="info-title">Dites-nous votre désir</div>
              <div className="info-description">
                Complétez le formulaire afin que nous puissions en savoir plus sur votre souhait.
              </div>
            </li>
          </div>
          <div className="info-item-container">
            <div className='image-container'>
              <img src={Calendar} alt="description de l'image" className='img2' />
            </div>
            <li className="info-item">
              <div className="info-title">Choisissez l&apos;horaire</div>
              <div className="info-description">
                Vous pouvez choisir la date et l’heure pour discuter avec notre expert sans aucun frais.
              </div>
            </li>
          </div>
          <div className="info-item-container">
            <div className='image-container'>
              <img src={Ringing} alt="description de l'image" className='img2' />
            </div>
            <li className="info-item">
              <div className="info-title">Abonnez-vous à nos services</div>
              <div className="info-description">
                Si vous trouvez que nous sommes utiles, vous pouvez vous abonner à nos services.
              </div>
            </li>
          </div>
        </ul>
      </div>

      <div className="contact-right">
        <h2>About</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div>
            <label>Nom et Prénom</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Sujet</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Parlez-nous de votre projet</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Soumettre</button>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;