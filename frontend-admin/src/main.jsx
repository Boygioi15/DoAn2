import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout/RootLayout";
import "./main.css";
import "./others/local_copy_of_google_font.css";

import ProductManagementPage from "./pages/ProductManagementPage/ProductManagementPage";
import TestUploadPage from "./pages/Test/TestUpload";
import CategoryManagementPage from "./pages/CategoryManagementPage/CategoryManagementPage";
import EditProductPage from "./pages/AddNewProductPage/EditProductPage";
import UserManagementPage from "./pages/UserManagementPage/UserManagementPage";
import OrderManagementPage from "./pages/OrderManagementPage/OrderManagementPage";
import TermAndConditionPage from "./pages/FrontendSettingPage/TermAndConditionPage";
import FrontendSettingPage from "./pages/FrontendSettingPage/FrontendSettingPage";
import NotFoundPage from "./pages/NotFoundPage";

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
        element: <EditProductPage />,
        path: "edit-product",
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
        element: <CategoryManagementPage />,
        path: "category-management",
      },
      {
        element: <OrderManagementPage />,
        path: "order-management",
      },
      {
        element: <FrontendSettingPage />,
        path: "frontend-setting",
      },
      {
        element: <TermAndConditionPage />,
        path: "term-and-condition",
      },
      {
        element: <TestUploadPage />,
        path: "test-upload",
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
