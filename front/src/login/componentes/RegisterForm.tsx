import { useState } from 'react';
import { registerApi, saveAuth } from '../api/authApi';

type Props = {
    onSuccess?: () => void;
    goLogin?: () => void;
};

export function RegisterForm({ onSuccess, goLogin }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [subname, setSubname] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await registerApi({ email, password, name, subname });
            const { accessToken, user } = res.data;
            saveAuth(accessToken, user);
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
                <h2 className="h4 mb-3">Crear cuenta</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="row g-2">
                    <div className="col-12">
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

                    <div className="col-12">
                        <label className="form-label">Contrasena</label>
                        <input
                            className="form-control"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                            minLength={8}
                        />
                        <div className="form-text">Minimo 8 caracteres.</div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Nombre</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={1}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Apellidos</label>
                        <input
                            className="form-control"
                            value={subname}
                            onChange={(e) => setSubname(e.target.value)}
                            required
                            minLength={1}
                        />
                    </div>
                </div>

                <button className="btn btn-success w-100 mt-3" disabled={loading}>
                    {loading ? 'Creando...' : 'Registrarse'}
                </button>

                {goLogin && (
                    <p className="text-center mt-3">
                        ¿Ya estás registrado?{' '}
                        <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={goLogin}
                        >
                            Iniciar sesión
                        </button>
                    </p>
                )}
            </div>
        </form>
    );
}