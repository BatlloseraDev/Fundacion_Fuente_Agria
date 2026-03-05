import { useNavigate } from 'react-router';
import { RegisterForm } from '../componentes/RegisterForm';

export function RegisterPage() {
    const navigate = useNavigate();

    return (
        <div className="container py-5" style={{ maxWidth: 620 }}>
            <RegisterForm
                onSuccess={() => navigate('/inicio')}
                goLogin={() => navigate('/login')}
            />
        </div>
    );
}