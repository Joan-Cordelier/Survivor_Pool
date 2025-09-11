import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Importation de tes composants
import Home from '../Home/Home.jsx';
import Event from '../Event/event.jsx';
import About from '../About/About.jsx';
import Profile from '../Profile/Profile.jsx';
import Header from '../template/Headers/Headers.jsx';  // Ton header
import Project from '../Project/project.jsx';  // Ton offre
import News from '../News/news.jsx';
import Login from '../Login/Login.jsx'
import Dashboard from '../Dashboard/Dashboard.jsx';
import StartupPage from '../Startup/Startup.jsx';
import Messaging from '../Messaging/Messaging.jsx';

// Si tu veux ajouter un Footer plus tard
import Footer from '../template/Footer/Footer.jsx'; 

function App() {
  return (
    <BrowserRouter basename="/Survivor_Pool">
      <Header />  {/* Le Header sera affiché sur toutes les pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Projects" element={<Project />} />
        <Route path="/Events" element={<Event />} />
        <Route path="/About" element={<About />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/News" element={<News />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Messaging" element={<Messaging />} />
  <Route path="/Startup" element={<StartupPage />} />
      </Routes>
      <Footer />  {/* Le Footer sera aussi affiché sur toutes les pages */}
    </BrowserRouter>
  );
}

export default App;
