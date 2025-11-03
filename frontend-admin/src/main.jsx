import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserManagementPage from "./pages/UserManagementPage";
import RootLayout from "./layouts/RootLayout/RootLayout";
import "./app.css";
import "./main.css";
import "./others/local_copy_of_google_font.css";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    path: "/",
    children: [
      {
        element: <UserManagementPage />,
        path: "user",
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
