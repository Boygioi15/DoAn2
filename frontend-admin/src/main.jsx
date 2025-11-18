import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserManagementPage from "./pages/UserManagementPage";
import RootLayout from "./layouts/RootLayout/RootLayout";
import "./main.css";
import "./others/local_copy_of_google_font.css";
import AddNewProductPage from "./pages/AddNewProductPage/AddNewProductPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import TestUploadPage from "./pages/Test/TestUpload";
import CategoryPage from "./pages/CategoryPage/CategoryPage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    path: "/",
    children: [
      {
        element: <UserManagementPage />,
        path: "user",
      },
      {
        element: <AddNewProductPage />,
        path: "add-product",
      },
      {
        element: <ProductManagementPage />,
        path: "product-management",
      },
      {
        element: <CategoryPage />,
        path: "category-management",
      },
      {
        element: <TestUploadPage />,
        path: "test-upload",
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
