import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Fast Refresh de Vite: Permite exportar contextos u otras cosas temporalmente
      'react-refresh/only-export-components': 'warn',
      
      // Efectos de React: No bloquea si usas setState dentro de un useEffect ())
      'react-hooks/set-state-in-effect': 'warn',
      
      // Dependencias de los hooks: Avisa si falta algo en el array [ ], pero no falla
      'react-hooks/exhaustive-deps': 'warn',
      
      // Variables no usadas (por ejemplo, el jwtDecode)
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
])
