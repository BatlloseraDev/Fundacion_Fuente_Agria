import { useState } from 'react';
import { loginApi, saveAuth } from '../api/authApi';
import { use } from 'react';
import { UserContext } from '../../context/userContext';

type Props = {
    onSuccess?: () => void;
    goRegister?: () => void;
};

export function LoginForm({ onSuccess, goRegister }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {login} = use(UserContext);


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await loginApi({ email, password });
            const { accessToken, user } = res.data;
            saveAuth(accessToken, user);
            login(accessToken);
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card shadow-sm">
            <div className="card-body">
                <h2 className="h4 mb-3">Iniciar sesion</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        className="form-control"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Contrasena</label>
                    <input
                        className="form-control"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        minLength={8}
                    />
                </div>

                <button className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>

                {goRegister && (
                    <p className="text-center mt-3">
                        ¿No tienes cuenta?{' '}
                        <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={goRegister}
                        >
                            Registrarse
                        </button>
                    </p>
                )}
            </div>
        </form>
    );
}