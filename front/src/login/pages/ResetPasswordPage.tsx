import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { resetPassword } from '../api/authApi';

export const ResetPasswordPage = () => {
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !email) {
            setError('Enlace inválido.');
            return;
        }

        try {
            await resetPassword(email, token, password);
            setMessage('Contraseña actualizada con éxito. Redirigiendo...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('El token es inválido o ha caducado.');
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-md-6">
                    <h2 className="text-center mb-4">Nueva Contraseña</h2>
                    {message ? (
                        <p className="alert alert-success text-center">{message}</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error && <p className="alert alert-danger text-center">{error}</p>}
                            <div className="mb-3">
                                 <label htmlFor="password" className="form-label">Nueva contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="form-control"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Actualizar contraseña</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};