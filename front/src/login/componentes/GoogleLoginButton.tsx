import { useEffect, useRef, useState, use } from 'react';
import { googleLoginApi, saveAuth } from '../api/authApi';
import { UserContext } from '../../context/userContext';

declare global {
  interface Window {
    google?: any;
  }
}

type Props = {
  onSuccess?: () => void;
};

export function GoogleLoginButton({ onSuccess }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [error, setError] = useState('');
  const { login } = use(UserContext);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    if (!clientId) {
      setError('Falta VITE_GOOGLE_CLIENT_ID en el .env');
      return;
    }

    const tryInit = () => {
      if (!window.google?.accounts?.id || !divRef.current || initializedRef.current) {
        return;
      }

      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: any) => {
          setError('');

          try {
            const idToken = resp.credential;
            const res = await googleLoginApi(idToken);

            const { accessToken, user } = res.data;
            saveAuth(accessToken, user);
            login(accessToken);
            onSuccess?.();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo iniciar sesion con Google');
          }
        },
      });

      divRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'outline',
        size: 'large',
        width: 260,
      });
    };

    const interval = setInterval(tryInit, 200);
    tryInit();

    return () => {
      clearInterval(interval);
      initializedRef.current = false;
      window.google?.accounts?.id?.cancel?.();
    };
  }, [login, onSuccess]);

  return (
    <div className="mt-3">
      {error && <div className="alert alert-danger">{error}</div>}
      <div ref={divRef} />
    </div>
  );
}