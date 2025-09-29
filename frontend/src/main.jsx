import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout/RootLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ProfileLayout from './layouts/ProfileLayout.jsx'

//font stuff
import './others/local_copy_of_google_font.css'
import AuthLayout from './layouts/AuthLayout/AuthLayout.jsx'
import SignInUpPage from './pages/AuthPage/SignInUpPage.jsx'
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
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
    ],
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <SignInUpPage />,
      },
    ],
  },
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
