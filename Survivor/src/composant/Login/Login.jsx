import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.scss';
import * as AuthApi from '../../apis/BackendApi/Auth.api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialiser le hook useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();

    console.log('Données soumises : ', { email, password });

        try {
            const data = await AuthApi.login(email, password); // data = { user, token }
            console.log('Réponse reçue:', data);
                        if (data?.token) {
                                // Persist token + user (avec rôle) pour que le Header le détecte au re-mount
                                localStorage.setItem('token', data.token);
                                if (data.user) {
                                    localStorage.setItem('user', JSON.stringify(data.user));
                                }
                                localStorage.removeItem('jwtToken');
                                setMessage('Authentification réussie !');
                                // Force un refresh pour que le Header hydrate immédiatement et affiche Dashboard si admin
                                // On redirige vers la route Dashboard (même casse que NavLink)
                                window.location.href = '/Dashboard';
            } else {
                setMessage('Réponse inattendue du serveur.');
            }
        } catch (err) {
            console.error('Erreur lors de l\'authentification:', err);
            const apiMsg = err?.data?.message || err?.message || 'Erreur lors de l\'authentification.';
            setMessage(apiMsg);
        }
    };

    return (
        <div className='form-container'>
            <form onSubmit={handleSubmit} className='form'>
                <h2>Log In</h2>
                <div className='form-name'>
                    <label>Email :</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className='form-password'>
                    <label>Password :</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Log In</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
