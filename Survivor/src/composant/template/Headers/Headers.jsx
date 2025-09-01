import "./Headers.scss";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import Fb from "../../../assets/facebook.svg";
import Insta from "../../../assets/instagram.svg";
import TikTok from "../../../assets/tiktok.svg";
import Logo from "../../../assets/Demain.png";

const Header = () => {
  const [showLinks, setshowLinks] = useState(false);

  const closeMenu = () => {
    setshowLinks(false);
  };

  const handleShowLinks = () => {
    setshowLinks(!showLinks);
  };
  return (
    <nav className="nav">
      <NavLink to="/">
        <img src={Logo} alt="description de l'image" className="img" />
      </NavLink>

      {/* Navigation links */}
      <div className={`nav-links ${showLinks ? "show-nav" : ""} `}>
        <div className="nav-left">
          <ul className="nav-left-list">
            <li className="nav-left-list-item">
              <NavLink className="nav-link" to="/" onClick={closeMenu}>
                Page d&apos;accueil
              </NavLink>
            </li>
            <li className="nav-left-list-item">
              <NavLink className="nav-link" to="/notre-offre" onClick={closeMenu}>
                Notre offre
              </NavLink>
            </li>
            <li className="nav-left-list-item">
              <NavLink className="nav-link" to="/contenu-gratuit" onClick={closeMenu}>
                Contenu gratuit
              </NavLink>
            </li>
            <li className="nav-left-list-item">
              <NavLink className="nav-link" to="/rendez-vous" onClick={closeMenu}>
                Rendez-vous
              </NavLink>
            </li>
            <li className="nav-left-list-item">
              <NavLink className="nav-link" to="/contactez-nous" onClick={closeMenu}>
                Contactez-nous
              </NavLink>
            </li>
            <li className="nav-left-list-item">
              <a className="nav-link" href="https://members.demainthailande.fr" target="_blank" rel="noopener noreferrer">
                Déjà client ?
              </a>
            </li>

          </ul>
        </div>

        {/* Social Media Icons */}
        <div className="nav-right">
          <ul className="social-media-list">
            <li className="social-media-item">
              <a
                href="https://www.facebook.com/profile.php?id=61563239763649"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={Fb} alt="Facebook" className="social-icon" />
              </a>
            </li>
            <li className="social-media-item">
              <a
                href="https://www.instagram.com/demain_thailande_tls/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={Insta} alt="Instagram" className="social-icon" />
              </a>
            </li>
            <li className="social-media-item">
              <a
                href="https://www.tiktok.com/@demainthailande?_t=8qZF5VJDbWa&_r=1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={TikTok} alt="TikTok" className="social-icon" />
              </a>
            </li>
          </ul>
        </div>

      </div>
      <button
        className={`navbar-burger ${showLinks ? "show-nav" : ""}`}
        onClick={handleShowLinks}
      >
        <span className="burger-bar"></span>
      </button>
    </nav>
  );
};

export default Header;
