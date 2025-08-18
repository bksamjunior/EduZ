# EduZ Frontend

A modern React+Vite frontend for the EduZ Quiz and Question Management System.

## Features
- User authentication (Sign Up, Login, Logout)
- Role-based dashboards (Student, Teacher, Admin)
- Quiz taking and results
- Question management (add question)
- Admin user promotion
- Grayscale UI with green/red feedback
- Responsive and accessible design

## Getting Started

1. Install dependencies:
  ```sh
  npm install
  ```
2. Start the development server:
  ```sh
  npm run dev
  ```
3. The app will be available at `http://localhost:5173` by default.

## Project Structure
- `src/pages/` — Main pages (Login, Signup, Dashboards, etc.)
- `src/components/` — Shared UI components (NavBar, etc.)
- `src/api/` — API instance and helpers
- `src/store/` — Global state management (user, etc.)
- `src/hooks/` — Custom hooks (notifications, etc.)
- `src/theme.ts` — MUI theme configuration

## Environment
- Connects to a FastAPI backend (see backend docs for API details)

## License
MIT
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
