import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GoogleAnalytics from '../BaliseGoogle/GloogleAnalytics.jsx';
// Importation de tes composants
import Home from '../Home/Home.jsx';
import Rendezvous from '../Rdv/Rdv.jsx';
import Contact from '../Contact/Contact.jsx';
import DejaClient from '../Client/Client.jsx';
import Header from '../template/Headers/Headers.jsx';  // Ton header
import Offre from '../Offre/Offre.jsx';  // Ton offre
import News from '../News/Cont.jsx';

// Si tu veux ajouter un Footer plus tard
import Footer from '../template/Footer/Footer.jsx'; 

function App() {
  return (
    <Router>
      <GoogleAnalytics />
      {/* <Baniere /> */}
      <Header />  {/* Le Header sera affiché sur toutes les pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Projects" element={<Offre />} />
        <Route path="/Events" element={<Rendezvous />} />
        <Route path="/About" element={<Contact />} />
        <Route path="/deja-client" element={<DejaClient />} />
        <Route path="/News" element={<News />} />
      </Routes>
      <Footer />  {/* Le Footer sera aussi affiché sur toutes les pages */}
    </Router>
  );
}

export default App;
