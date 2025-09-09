import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GoogleAnalytics from '../BaliseGoogle/GloogleAnalytics.jsx';
// Importation de tes composants
import Home from '../Home/Home.jsx';
import Rendezvous from '../Event/event.jsx';
import Contact from '../Contact/Contact.jsx';
import Profile from '../Profile/Profile.jsx';
import Header from '../template/Headers/Headers.jsx';  // Ton header
import Offre from '../Project/project.jsx';  // Ton offre
import News from '../News/news.jsx';
import Login from '../Login/Login.jsx'
import Dashboard from '../Dashboard/Dashboard.jsx';

// Si tu veux ajouter un Footer plus tard
import Footer from '../template/Footer/Footer.jsx'; 

function App() {
  return (
    <BrowserRouter basename="/Survivor_Pool">
      <GoogleAnalytics />
      <Header />  {/* Le Header sera affiché sur toutes les pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Projects" element={<Offre />} />
        <Route path="/Events" element={<Rendezvous />} />
        <Route path="/About" element={<Contact />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/News" element={<News />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
      <Footer />  {/* Le Footer sera aussi affiché sur toutes les pages */}
    </BrowserRouter>
  );
}

export default App;
