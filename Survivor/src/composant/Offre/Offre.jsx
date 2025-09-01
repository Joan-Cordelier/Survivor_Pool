import './Offre.scss';
import expertImage from '../../assets/benoit.jpg'; // Remplacez par le chemin de votre image
import axios from 'axios'; // Assurez-vous que axios est installé et importé

const Offre = () => {

    const handleJoinNowClick = () => {
        const sendAnalyticsEvent = () => {
            if (window.gtag) {
                console.log("Envoi de l'événement à Google Analytics via GTM");
                window.gtag('event', 'click_join_now', {
                    event_category: 'Button',
                    event_label: 'Join Now',
                    value: 1,
                });
            } else {
                console.warn("Google Analytics n'est pas encore chargé.");
            }
        };
    
        // Attendre que Google Analytics soit chargé avant d'envoyer l'événement
        if (!window.gtag) {
            const interval = setInterval(() => {
                if (window.gtag) {
                    clearInterval(interval);
                    sendAnalyticsEvent();
                    handleRedirect();
                }
            }, 100); // Vérifie toutes les 100 ms
        } else {
            sendAnalyticsEvent();
            handleRedirect(); // Appeler la fonction pour gérer la redirection
        }
    };

    // Fonction de redirection avec axios
    const handleRedirect = () => {
        // Vous pouvez envoyer une requête HTTP avec axios ici avant de rediriger
        axios.post('https://your-api-endpoint.com/track', {
            event: 'click_join_now',
            // autres données à envoyer si nécessaire
        }).then(() => {
            // Après le succès de la requête, effectuer la redirection vers Stripe
            window.location.href = "https://buy.stripe.com/bIY9C10Q3ePacCY3cc";
        }).catch((error) => {
            console.error("Erreur lors de la requête axios:", error);
            // Redirection même en cas d'échec de la requête
            window.location.href = "https://buy.stripe.com/bIY9C10Q3ePacCY3cc";
        });
    };

    return (
        <div className='offer-container'>
            <div className="offer-wrapper">
                <div className="offer-content">
                    <h2 className="offer-title">ABONNEZ-VOUS AU SERVICE COMPLET</h2>
                    <ul className="offer-list">
                        <li>Premières 45 minutes gratuites pour discuter de votre projet avec notre expert</li>
                        <li>Accès à notre communauté de français expatriés qui vivent déjà en Thaïlande</li>
                        <li>Accès à l&apos;e-learning, afin de pouvoir trouver toute l&apos;info qui vous intéresse</li>
                        <li>Accès illimité pendant 1 an</li>
                    </ul>
                    <button id='join-now' className="offer-button" onClick={handleJoinNowClick}>
                        Join Now
                    </button>
                </div>
                <div className="offer-image">
                    <img src={expertImage} alt="Expert" />
                </div>
            </div>
        </div>
    );
};

export default Offre;
