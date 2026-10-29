import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../Layout/Layout";
import ProtectedRoute from "./ProtectedRoute";


const Home = lazy(() => import("../Pages/Home"));
const AllFood = lazy(() => import("../Pages/AllFood"));
const ProductItems = lazy(() => import("../Pages/ProductItems"));
const Checkout = lazy(() => import("../Pages/Checkout"));
const ManagerPanel = lazy(() => import("../ManagerPanel"));
const OwnerAdminPanel = lazy(() => import("../OwnerAdminPanel"));
const SignIn = lazy(() => import("../AdminAuthentication/Signin"));
const SignUp = lazy(() => import("../AdminAuthentication/Signup"));
const Loader = () => (
  <div className="fixed inset-0 z-[9999] grid place-items-center bg-white">
    <div className="size-14 animate-spin rounded-full border-4 border-red-100 border-t-[var(--color-primary-600)]" />
  </div>
);

const page = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
    
  </Suspense>
);

const routes = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: page(Home) },
      { path: "/allfood", element: page(AllFood) },
      { path: "/allfood/:categoryId/:itemId", element: page(ProductItems) },
      { path: "/checkout", element: page(Checkout) },


{
  path: "/owneradminpanel",
  element: (
    <ProtectedRoute role="owner">
      {page(OwnerAdminPanel)}
    </ProtectedRoute>
  ),
},


{
  path: "/managerpanel",
  element: (
    <ProtectedRoute role="manager">
      {page(ManagerPanel)}
    </ProtectedRoute>
  ),
},

  { path: "/signup", element: page(SignUp) },
{ path: "/signin", element: page(SignIn) },

    ],
  },
]);

const Router = () => <RouterProvider router={routes} />;

export default Router;