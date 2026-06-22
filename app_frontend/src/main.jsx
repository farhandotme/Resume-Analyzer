import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import About from './pages/About.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/NotFound.jsx';
import AnalyseResume from './pages/AnalyseResume.jsx';
import Toaster from './components/Toaster.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/about',
        element: <About />,
    },
    {
        path: '/signup',
        element: <Signup />,
    },
    {
        path: '/analyseresume',
        element: <AnalyseResume />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

function Root() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

    return (
        <>
            <RouterProvider router={router} />
            <Toaster />
        </>
    );
}

createRoot(document.getElementById('root')).render(<Root />);
