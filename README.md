# TimeCore Frontend - React + TypeScript + Vite

This project is the frontend for TimeCore, a calendar application built with React, TypeScript, and Vite. It provides a user-friendly interface for managing events, importing schedules from PDFs, and configuring user profiles.

## Technologies Used

-   **React:** A JavaScript library for building user interfaces.
-   **TypeScript:** A typed superset of JavaScript that enhances code quality and maintainability.
-   **Vite:** A fast build tool and development server for modern web projects.
-   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
-   **Zustand:** A small, fast and scalable bearbones state-management solution.
-   **React Big Calendar:** Calendar component for React.
-   **Axios:** Promise based HTTP client for the browser and node.js

## Project Structure

The project structure is organized as follows:

-   `src/`: Contains the main application code.
    -   `components/`: Reusable React components.
    -   `pages/`: React components for different routes/pages.
    -   `services/`: API service functions for interacting with the backend.
    -   `store/`: Zustand store for managing application state (e.g., calendar events).
    -   `types/`: TypeScript type definitions.
    -   `App.tsx`: The main application component.
-   `public/`: Static assets.
-   `vite.config.ts`: Vite configuration file.
-   `package.json`: npm package file.
-   `USERGUIDE.md`: [User guide documentation](USERGUIDE.md).
-   `README.md`: Project documentation.

## Getting Started

Follow these steps to set up and run the TimeCore frontend:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Mohaamedl/TimeCore---Frontend.git
    cd timecore_frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    Create a `.env` file in the project root and define the necessary environment variables, such as the API base URL:

    ```
    VITE_API_BASE_URL=http://localhost:8080
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will start the Vite development server, and you can access the application in your browser at `http://localhost:5173`.

## Building for Production

To build the application for production, run the following command:

```bash
npm run build
```

This will create an optimized build of the application in the `dist` directory.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
