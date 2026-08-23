import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';
import '@fontsource/fraunces/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import { ThemeProvider } from './context/ThemeContext';

const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.classList.add(savedTheme);
} else {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.classList.add(systemTheme);
}

const router = createBrowserRouter([
    {
        path: '/*',
        element: (
            <ThemeProvider>
                <App />
            </ThemeProvider>
        ),
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);