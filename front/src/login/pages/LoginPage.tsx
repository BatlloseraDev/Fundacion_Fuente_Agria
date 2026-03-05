import { useNavigate } from 'react-router';
import { LoginForm } from '../componentes/LoginForm';

export function LoginPage() {
    const navigate = useNavigate();

    return (
        <div className="container py-5" style={{ maxWidth: 520 }}>
            <LoginForm
                onSuccess={() => navigate('/inicio')}
                goRegister={() => navigate('/register')}
            />
        </div>
    );
}