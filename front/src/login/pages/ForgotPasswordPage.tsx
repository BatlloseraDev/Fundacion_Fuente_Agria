import React, { useState } from 'react';
import { requestPasswordReset } from '../api/authApi';
import { useNavigate } from 'react-router';


export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await requestPasswordReset(email);
            setMessage(res.message);
            setError('');
        } catch (err) {
            setError('Introduce un correo electrónico válido.');
            setMessage('');
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-md-6" >
                    <h2 className="text-center mb-4" >Recuperar Contraseña</h2>
                    {message && <p className="alert alert-success text-center">{message}</p>}
                    {error && <p className="alert alert-danger text-center">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email" className="form-label">Tu correo electrónico</label>
                        <input
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-control"
                        />
                        <button type="submit" className="btn btn-primary w-100">Enviar enlace</button>
                    </form>
                    <div className="text-center mt-3">
                        <button
                            className="btn btn-link"
                            onClick={() => navigate('/login')}
                            style={{ textDecoration: 'none' }}
                        >
                            Volver al inicio de sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};