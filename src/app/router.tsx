import { Outlet, redirect, ScrollRestoration, type RouteObject } from 'react-router';
import { DeletePurchaseSheet } from '../pages/DeletePurchaseSheet';
import { EditItemSheet } from '../pages/EditItemSheet';
import { ErrorPage } from '../pages/ErrorPage';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Processing } from '../pages/Processing';
import { Products } from '../pages/Products';
import { ProductSheet } from '../pages/ProductSheet';
import { PurchaseDetail } from '../pages/PurchaseDetail';
import { Purchases } from '../pages/Purchases';
import { Review } from '../pages/Review';
import { Scan } from '../pages/Scan';
import { TotalSheet } from '../pages/TotalSheet';
import { AppShell } from './AppShell';
import {
  deletePurchaseAction,
  itemAction,
  loginLoader,
  logoutAction,
  purchaseLoader,
  purchasesLoader,
  requireUser,
  totalAction,
} from './loaders';

const editItemRoute: RouteObject = {
  path: 'items/:itemId',
  action: itemAction,
  element: <EditItemSheet />,
};
const totalRoute: RouteObject = { path: 'total', action: totalAction, element: <TotalSheet /> };
const deleteRoute: RouteObject = {
  path: 'delete',
  action: deletePurchaseAction,
  element: <DeletePurchaseSheet />,
};
// Sheets that open over both the detail and the review screen.
const sheetRoutes = [editItemRoute, totalRoute, deleteRoute];

export const routes: RouteObject[] = [
  {
    element: (
      <>
        <Outlet />
        <ScrollRestoration />
      </>
    ),
    errorElement: <ErrorPage />,
    HydrateFallback: () => null,
    children: [
      { path: 'login', loader: loginLoader, element: <Login /> },
      { path: 'logout', loader: () => redirect('/'), action: logoutAction },
      {
        id: 'auth',
        loader: requireUser,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, loader: purchasesLoader, element: <Home /> },
              { path: 'purchases', loader: purchasesLoader, element: <Purchases /> },
              {
                path: 'products',
                id: 'products',
                loader: purchasesLoader,
                element: <Products />,
                children: [{ path: ':productKey', element: <ProductSheet /> }],
              },
              {
                path: 'purchases/:id',
                id: 'purchase',
                loader: purchaseLoader,
                children: [
                  {
                    element: <PurchaseDetail />,
                    children: [{ index: true, element: null }, ...sheetRoutes],
                  },
                  { path: 'review', element: <Review />, children: sheetRoutes },
                ],
              },
            ],
          },
          { path: 'scan', element: <Scan /> },
          { path: 'scan/processing', element: <Processing /> },
        ],
      },
    ],
  },
];
