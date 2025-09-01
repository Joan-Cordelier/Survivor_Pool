import './Rdv.scss'; // Si tu utilises un fichier SCSS pour styliser cette page

function Rendezvous() {
  return (
    <div className="rendezvous-container">
      <h1 className="rendezvous-title">Prenez Rendez-vous</h1>
      
      <div className="iframe-wrapper">
        <iframe
          src="https://resa.demainthailande.fr/"
          width="100%"  // Prend toute la largeur disponible
          height="800px"  // Ajuste la hauteur selon tes besoins
          style={{ border: 'none' }}  // Supprime la bordure
          title="Rendez-vous"
        ></iframe>
      </div>
    </div>
  );
}

export default Rendezvous;
