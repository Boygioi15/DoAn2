import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from 'react-router-dom';
import RootLayout from './layouts/RootLayout/RootLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfileLayout from './layouts/ProfileLayout/ProfileLayout.jsx';

//font stuff
import './others/local_copy_of_google_font.css';

import AuthLayout from './layouts/AuthLayout/AuthLayout.jsx';
import { SignInPage, SignUpPage } from './pages/AuthPage/SignInUpPage.jsx';
import ModalContextProvider from './contexts/ModalContext.jsx';
import {
  SignUpDetailPage1,
  SignUpDetailPage2,
  SignUpDetailPage3,
} from './pages/AuthPage/SignUpDetailPage/SignUpDetailPage.jsx';
import NotFoundPage from './pages/ErrorPages/NotFoundPage.jsx';
import ErrorPage from './pages/ErrorPages/ErrorPage.jsx';
import AccountInfoPage from './pages/ProfilePages/AccountInfoPage/AccountInfoPage.jsx';
import PasswordPage from './pages/ProfilePages/PasswordPage/PasswordPage.jsx';
import AddressPage from './pages/ProfilePages/AddressPage/AddressPage.jsx';
import { Toaster } from 'sonner';
import ProductDetailPage from './pages/ProductDetailPage';
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
        children: [
          {
            path: 'account-info',
            element: <AccountInfoPage />,
          },
          {
            path: 'change-password',
            element: <PasswordPage />,
          },
          {
            path: 'address',
            element: <AddressPage />,
          },
        ],
      },
      {
        path: '/product-detail/:productId',
        element: <ProductDetailPage />,
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
        path: '/auth/sign-in',
        element: <SignInPage />,
      },
      {
        path: '/auth/sign-up',
        element: <SignUpPage />,
      },
      {
        path: '/auth/sign-up-detail/1',
        element: <SignUpDetailPage1 />,
      },
      {
        path: '/auth/sign-up-detail/2',
        element: <SignUpDetailPage2 />,
      },
      {
        path: '/auth/sign-up-detail/3',
        element: <SignUpDetailPage3 />,
      },
    ],
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
createRoot(document.getElementById('root')).render(
  <div>
    <RouterProvider router={router} />
    <Toaster richColors position="top-right" />
  </div>
);
