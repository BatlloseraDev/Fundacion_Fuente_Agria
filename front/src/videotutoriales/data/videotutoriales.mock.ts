import type { Videotutorial } from '../types/videotutorial.interface.ts';

export const videotutorialesMock: Videotutorial[] = [
  {
    id: 'como-hacer-encargo',
    titulo: '¿Cómo hacer un encargo?',
    descripcion:
      'Aprende paso a paso cómo realizar un encargo personalizado en nuestra fundación. Desde seleccionar el producto hasta confirmar tu solicitud, este tutorial te guiará por todo el proceso de forma sencilla.',
    pasos: [
      'Navega a la sección "Encargos".',
      'Pulsa el botón "Solicitar presupuesto" para abrir el formulario de solicitud.',
      'Rellena todos los campos, ya que son necesarios para realizar el encargo',
      'Dale a "Enviar Solicitud"',
      'Recibirás un correo de confirmación con los siguientes pasos.',
    ],
    videoId: 'WfWCryDDQ9s',
    icono: 'bi-bag-check',
  },
  {
    id: 'como-loggearse-google',
    titulo: '¿Cómo iniciar sesión con Google?',
    descripcion:
      'Inicia sesión de forma rápida y segura usando tu cuenta de Google. No necesitas recordar contraseñas adicionales: con un solo clic estarás dentro de tu área personal.',
    pasos: [
      'Ve a la página de inicio de sesión pulsando "Iniciar sesión" en la barra de navegación.',
      'Haz clic en el botón "Continuar con Google" que aparece bajo el formulario.',
      'Selecciona tu cuenta de Google en la ventana emergente.',
      'Acepta los permisos necesarios para acceder a la plataforma.',
      'Serás redirigido automáticamente a tu página de inicio con la sesión activa.',
    ],
    videoId: 'qxiXrMWnfH8',
    icono: 'bi-google',
  },
  {
    id: 'como-registrarse',
    titulo: '¿Cómo crear una cuenta nueva?',
    descripcion:
      'Si todavía no tienes cuenta en nuestra plataforma, este tutorial te explica cómo registrarte en pocos minutos para poder hacer encargos y seguir tus pedidos.',
    pasos: [
      'Pulsa "Iniciar sesión" en la barra de navegación superior.',
      'Haz clic en el enlace "¿No tienes cuenta? Registrarse".',
      'Completa el formulario con tu nombre, apellidos, email y contraseña.',
      'Acepta los términos y condiciones y pulsa "Crear cuenta".',
    ],
    videoId: 'dQw4w9WgXcQ',
    icono: 'bi-person-plus',
  },

];