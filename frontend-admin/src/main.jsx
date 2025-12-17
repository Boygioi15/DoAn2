import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout/RootLayout";
import "./main.css";
import "./others/local_copy_of_google_font.css";
import AddNewProductPage from "./pages/ProductPages/AddNewProductPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import TestUploadPage from "./pages/Test/TestUpload";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import EditProductPage from "./pages/ProductPages/EditProductPage";
import CustomerManagementPage from "./pages/UserManagementPage/CustomerManagementPage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    path: "/",
    children: [
      {
        element: <CustomerManagementPage />,
        path: "customer",
      },
      {
        element: <AddNewProductPage />,
        path: "add-product",
      },
      {
        element: <EditProductPage />,
        path: "edit-product/:productId",
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
