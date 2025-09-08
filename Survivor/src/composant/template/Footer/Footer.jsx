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
        <a href="">
          <img className="footer-icon" src={instagram} alt="Instagram" />{" "}
        </a>
        <a href="">
          <img className="footer-icon" src={Tiktok} alt="Instagram" />{" "}
        </a>
        <a href="">
          <img className="footer-icon" src={Fb} alt="Facebook" />{" "}
        </a>
      </div>
      <div className="footer-logo">
        <img src={Logo} alt="Logo" />
        <p className="logo-title">JEB Incubator</p>
        <p className="logo-p">&quot;Laissez-nous réaliser vos rêves&quot;</p>
      </div>
      <div className="footer-contact">
        <a href="mailto:">
          <img className="footer-icon" src={mail} alt="Mail" />{" "}
          contact@jebincubator.fr
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
