import { useNavigate } from 'react-router';
import { LoginForm } from '../componentes/LoginForm';
import { GoogleLoginButton } from '../componentes/GoogleLoginButton';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <LoginForm
        onSuccess={() => navigate('/inicio', { replace: true })}
        goRegister={() => navigate('/register')}
      />

      <div className="text-center my-3 text-secondary">o</div>

      <div className="d-flex justify-content-center">
        <GoogleLoginButton onSuccess={() => navigate('/inicio', { replace: true })} />
      </div>
    </div>
  );
}