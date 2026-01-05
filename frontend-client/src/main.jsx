import { createRoot } from 'react-dom/client';
import './main.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout/RootLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfileLayout from './layouts/ProfileLayout/ProfileLayout.jsx';

//font stuff
import './others/local_copy_of_google_font.css';

import AuthLayout from './layouts/AuthLayout/AuthLayout.jsx';
import { SignInPage, SignUpPage } from './pages/AuthPage/SignInUpPage.jsx';
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
import SearchPage from './pages/SearchPage';
import DetailedCategoryPage from './pages/DetailedCategoryPage';
import CheckoutPageWrapper from './pages/CheckoutPage/CheckoutPage';
import OrderPageWrapper from './pages/OrderResultPage';
import SuggestionPage from './pages/ProfilePages/AccountInfoPage/SuggestionPage.jsx';

import SearchByImagePage from './pages/SearchByImagePage';
import TermAndConditionPage from './pages/TermAndConditionPage';
import CategoryLandingPage from './pages/CategoryLandingPage';
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
            path: 'suggestion',
            element: <SuggestionPage />,
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
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/search-by-image',
        element: <SearchByImagePage />,
      },
      {
        path: '/category/:categoryId',
        element: <CategoryLandingPage />,
      },
      {
        path: '/category/:category1Id/:category2Id',
        element: <DetailedCategoryPage />,
      },
      {
        path: '/category/:category1Id/:category2Id/:category3Id',
        element: <DetailedCategoryPage />,
      },
      ////// ĐIỀU KHOẢN VÀ CHÍNH SÁCH//////
      {
        path: 'loyal-customer-condition',
        element: <TermAndConditionPage />,
      },
      {
        path: 'loyal-customer-policy',
        element: <TermAndConditionPage />,
      },
      {
        path: 'customer-security-policy',
        element: <TermAndConditionPage />,
      },
      {
        path: 'delivery-policy',
        element: <TermAndConditionPage />,
      },
      {
        path: 'general-size-guidance',
        element: <TermAndConditionPage />,
      },
      {
        path: 'contact',
        element: <TermAndConditionPage />,
      },
      {
        path: 'about',
        element: <TermAndConditionPage />,
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
    path: 'checkout',
    element: <CheckoutPageWrapper />,
  },
  {
    path: 'order',
    element: <OrderPageWrapper />,
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
