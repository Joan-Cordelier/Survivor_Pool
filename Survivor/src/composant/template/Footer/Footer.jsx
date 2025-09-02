import "./Footer.scss";
import instagram from "../../../assets/instagram.svg";
import mail from "../../../assets/mail.svg";
import address from "../../../assets/address.svg";
import Logo from "../../../assets/logo.png";
import Tiktok from "../../../assets/tiktok.svg";
import Fb from "../../../assets/facebook.svg";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-follow">
        <a href="https://www.instagram.com/demain_thailande_tls/">
          <img className="footer-icon" src={instagram} alt="Instagram" />{" "}
        </a>
        <a href="https://www.tiktok.com/@demainthailande?_t=8qZF5VJDbWa&_r=1">
          <img className="footer-icon" src={Tiktok} alt="Instagram" />{" "}
        </a>
        <a href="https://www.facebook.com/profile.php?id=61563239763649">
          <img className="footer-icon" src={Fb} alt="Facebook" />{" "}
        </a>
      </div>
      <div className="footer-logo">
        <img src={Logo} alt="Logo" />
        <p className="logo-title">Demain Thaïlande</p>
        <p className="logo-p">&quot;Laissez-nous réaliser vos rêves&quot;</p>
      </div>
      <div className="footer-contact">
        <a href="mailto:contact@demainthailande.fr">
          <img className="footer-icon" src={mail} alt="Mail" />{" "}
          contact@demainthailande.fr
        </a>
        <div className="footer-address-container">
          <img className="footer-icon" src={address} alt="Adresse" /> 6 Place
          Wilson 31000 Toulouse
        </div>
      </div>
    </div>
  );
};

export default Footer;
