import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import Ledger from "../pages/LedgerPage";
import LedgerCategoryList from "../pages/LedgerCategoryList";
import Program from "../pages/Program";
import { ActiveYearList } from "../components/ActiveYearList";
import StockListPage from "../pages/StockList";
import ItemsPage from "../pages/ItemsPage";
import LostStockPage from "../pages/LostStockPage";
import { UserList } from "../components/UserList";
import Sahachari from "../pages/Sahachari";
import SahachariUsers from "../pages/SahachariUsers";
import SahachariItems from "../pages/SahachariItems";
import ProfilePage from "../pages/Profile";
import ForgotPasswordScreen from "../pages/ForgotPasswordScreen";
import ProtectedRoute from "../layouts/ProtectedRoute";



export default function AppRouter() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC / NON-LOGGED-IN ROUTES
      ====================================================== */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />

        <Route
          path="/forgot/password"
          element={<ForgotPasswordScreen />}
        />
      </Route>


      {/* =====================================================
          SAHACHARI ITEMS
          Accessible WITHOUT login
      ====================================================== */}

      <Route element={<MainLayout />}>
        <Route
          path="/sahachari/items"
          element={<SahachariItems />}
        />
      </Route>


      {/* =====================================================
          PROTECTED ROUTES
          User MUST be logged in
      ====================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>

          {/* -------------------------------------------------
              LOGGED-IN USERS
          -------------------------------------------------- */}

          <Route index element={<Home />} />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />


          {/* -------------------------------------------------
              LEDGER HANDLE
              + all handle
          -------------------------------------------------- */}

          <Route
            element={
              <ProtectedRoute roles={["ledger handle"]} />
            }
          >
            <Route
              path="/ledger"
              element={<Ledger />}
            />

            <Route
              path="/ledger/category"
              element={<LedgerCategoryList />}
            />
          </Route>


          {/* -------------------------------------------------
              STOCK HANDLE
              + all handle
          -------------------------------------------------- */}

          <Route
            element={
              <ProtectedRoute roles={["stock handle"]} />
            }
          >
            <Route
              path="/stock"
              element={<StockListPage />}
            />

            <Route
              path="/stock/items"
              element={<ItemsPage />}
            />

            <Route
              path="/stock/lost"
              element={<LostStockPage />}
            />
          </Route>


          {/* -------------------------------------------------
              PROGRAM HANDLE
              + all handle
          -------------------------------------------------- */}

          <Route
            element={
              <ProtectedRoute roles={["program handle"]} />
            }
          >
            <Route
              path="/program"
              element={<Program />}
            />
          </Route>


          {/* -------------------------------------------------
              USER HANDLE
              + all handle
          -------------------------------------------------- */}

          <Route
            element={
              <ProtectedRoute roles={["user handle"]} />
            }
          >
            <Route
              path="/user"
              element={<UserList />}
            />
          </Route>


          {/* -------------------------------------------------
              ALL HANDLE ONLY
          -------------------------------------------------- */}

          <Route
            element={
              <ProtectedRoute roles={["all handle"]} />
            }
          >
            <Route
              path="/active/year"
              element={<ActiveYearList />}
            />
          </Route>


          {/* -------------------------------------------------
              SAHACHARI HANDLE
              + all handle
          -------------------------------------------------- */}

          <Route
            element={
              <ProtectedRoute roles={["sahachari handle"]} />
            }
          >
            <Route
              path="/sahachari"
              element={<Sahachari />}
            />

            <Route
              path="/sahachari/users"
              element={<SahachariUsers />}
            />
          </Route>

        </Route>
      </Route>


      {/* =====================================================
          DEFAULT
      ====================================================== */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* =====================================================
          404
      ====================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}