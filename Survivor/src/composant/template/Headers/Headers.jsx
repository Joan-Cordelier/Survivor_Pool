import "./Headers.scss";
import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as UserApi from '../../../apis/BackendApi/User.api';
import Logo from "../../../assets/logo.png";

const Header = () => {
  const [showLinks, setshowLinks] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (token && stored) {
        const parsed = JSON.parse(stored);
        setAuthUser(parsed);
        if (parsed?.id && !parsed?.image) {
          (async () => {
            try {
              const full = await UserApi.getUserById(parsed.id);
              if (full) {
                if (full.image) {
                  const merged = { ...parsed, image: full.image };
                  localStorage.setItem('user', JSON.stringify(merged));
                  setAuthUser(merged);
                } else {
                  localStorage.setItem('user', JSON.stringify({ ...parsed, name: full.name || parsed.name, email: full.email || parsed.email }));
                }
              }
            } catch {}
          })();
        }
      } else if (token)
        setAuthUser({ tokenOnly: true, role: 'default' });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const onAuthChanged = () => {
      try {
        const token = localStorage.getItem('token');
        const stored = localStorage.getItem('user');
        if (token && stored) {
          setAuthUser(JSON.parse(stored));
        } else if (token) {
          setAuthUser({ tokenOnly: true, role: 'default' });
        } else {
          setAuthUser(null);
        }
      } catch { /* noop */ }
    };
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

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
      <NavLink to="//">
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
          <div className="nav-dashboard" ref={menuRef}>
            {!authUser ? (
              <NavLink
                className="nav-link"
                to="/Login"
                state={{ from: (location?.pathname === '/Login' ? '/' : `${location?.pathname || '/' }${location?.search || ''}${location?.hash || ''}`) }}
                onClick={closeMenu}
              >
                Log In
              </NavLink>
            ) : (
              <div className="profile-wrap">
                <button
                  type="button"
                  className={`avatar-btn ${authUser?.image ? 'has-image' : ''}`}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(o => !o)}
                  title={authUser?.email || 'Profile'}
                >
                  {authUser?.image ? (
                    <img
                      src={authUser.image}
                      alt={authUser?.name || authUser?.email || 'Avatar'}
                      className="avatar-img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="avatar-circle">{(authUser?.name || authUser?.email || 'U').slice(0,1).toUpperCase()}</span>
                  )}
                </button>
                <span className="user-name">
                  {authUser?.name || authUser?.email || ''}
                </span>
                {menuOpen && (
                  <div className="profile-menu" role="menu">
                    <NavLink className="profile-item" role="menuitem" to="/Profile" onClick={() => { setMenuOpen(false); closeMenu(); }}>
                      Profile
                    </NavLink>
                    {authUser?.role === 'admin' && (
                      <NavLink className="profile-item" role="menuitem" to="/Dashboard" onClick={() => { setMenuOpen(false); closeMenu(); }}>
                        Dashboard
                      </NavLink>
                    )}
                    <button className="profile-item danger" role="menuitem" onClick={() => { setMenuOpen(false); handleLogoutUser(); }}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
