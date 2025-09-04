import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate pour la redirection
import './Login.scss';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialiser le hook useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Données soumises : ', {
            username,
            password
        });

        try {
            // Envoyer la requête d'authentification à l'API Symfony
            const response = await axios.post('http://localhost:8000/api/odoo/authenticate', {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                withCredentials: true // Ajoute cette ligne
            });

            console.log('Réponse reçue:', response.data);

            // Si l'authentification réussit, stocker le token et rediriger
            if (response.data.status === 'success') {
                const token = response.data.token;

                // Stocker le token dans le localStorage
                localStorage.setItem('jwtToken', token);

                console.log("Local storage :" + localStorage);

                // Afficher un message de succès
                setMessage('Authentification réussie !');

                // Rediriger vers la page protégée avec le hook useNavigate
                    navigate('/community');

            } else {
                console.log('Erreur:', response.data.message);
                setMessage('Erreur : ' + response.data.message);
            }
        } catch {
            console.error('Erreur lors de l\'authentification:');
            setMessage('Erreur lors de l\'authentification.');
        }
    };

    return (
        <div className='form-container'>
            <form onSubmit={handleSubmit} className='form'>
                <h2>Log In</h2>
                <div className='form-name'>
                    <label>User Name :</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className='form-password'>
                    <label>Mot de passe :</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Se connecter</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
