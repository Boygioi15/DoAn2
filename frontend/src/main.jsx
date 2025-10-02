import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout/RootLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfileLayout from './layouts/ProfileLayout.jsx';

//font stuff
import './others/local_copy_of_google_font.css';

import AuthLayout from './layouts/AuthLayout/AuthLayout.jsx';
import SignInUpPage from './pages/AuthPage/SignInUpPage.jsx';
import ModalContextProvider from './contexts/ModalContext.jsx';
import SignUpDetailPage from './pages/AuthPage/SignUpDetailPage/SignUpDetailPage.jsx';
import NotFoundPage from './pages/ErrorPages/NotFoundPage.jsx';
import ErrorPage from './pages/ErrorPages/ErrorPage.jsx';
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'profile',
        element: <ProfileLayout />,
        children: [],
      },
      {
        path: 'error',
        element: <ErrorPage />,
      },
    ],
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <SignInUpPage />,
      },
      {
        path: '/auth/sign-up-detail',
        element: <SignUpDetailPage />,
      },
    ],
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModalContextProvider>
      <RouterProvider router={router} />
    </ModalContextProvider>
  </StrictMode>
);
