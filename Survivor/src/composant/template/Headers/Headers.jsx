import "./Headers.scss";
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Fb from "../../../assets/facebook.svg";
import Insta from "../../../assets/instagram.svg";
import TikTok from "../../../assets/tiktok.svg";
import Logo from "../../../assets/logo.png";

const Header = () => {
  const [showLinks, setshowLinks] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();
  // Hydrate user auth state on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (token && stored) {
        setAuthUser(JSON.parse(stored));
      } else if (token) {
        // fallback minimal; tentera d'être remplacé après qu'un user soit stocké
        setAuthUser({ tokenOnly: true, role: 'default' });
      }
    } catch { /* ignore */ }
  }, []);

  const handleLogoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthUser(null);
    closeMenu();
    navigate('/');
  };

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
                Home
              </NavLink>
            </li>
            <li className="nav-left-list-item">
              <NavLink className="nav-link" to="/Projects" onClick={closeMenu}>
                Projects
              </NavLink>
            </li>
            <li className="nav-left-list-item">
              <NavLink className="nav-link" to="/News" onClick={closeMenu}>
                News
              </NavLink>
            </li>
            <li className="nav-left-list-item">
              <NavLink className="nav-link" to="/Events" onClick={closeMenu}>
                Events
              </NavLink>
            </li>
            <li className="nav-left-list-item">
              <NavLink className="nav-link" to="/About" onClick={closeMenu}>
                About
              </NavLink>
            </li>
            <li className="nav-left-list-item">
            </li>
          </ul>
        </div>
          <div className="nav-dashboard">
            {authUser?.role === 'admin' && (
              <NavLink className="nav-link" to="/Dashboard" onClick={closeMenu}>
                Dashboard
              </NavLink>
            )}
            {authUser ? (
              <button
                type="button"
                className="nav-link logout-link"
                style={{ background:'transparent', border:'0', cursor:'pointer' }}
                onClick={handleLogoutUser}
              >
                Log Out
              </button>
            ) : (
              <NavLink className="nav-link" to="/Login" onClick={closeMenu}>
                Log In
              </NavLink>
            )}
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
