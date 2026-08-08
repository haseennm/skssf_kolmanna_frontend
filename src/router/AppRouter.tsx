import { Routes, Route } from "react-router-dom";
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
      {/* 1. AUTH ROUTES (NO HEADER) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot/password" element={<ForgotPasswordScreen />} />
      </Route>

      {/* 2. MAIN LAYOUT ROUTES (SHOWS HEADER FOR ALL USERS) */}
      <Route element={<MainLayout />}>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/sahachari/items" element={<SahachariItems />} />

        {/* Protected Pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />

          {/* LEDGER */}
          <Route element={<ProtectedRoute roles={["ledger handle"]} />}>
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/ledger/category" element={<LedgerCategoryList />} />
          </Route>

          {/* STOCK */}
          <Route element={<ProtectedRoute roles={["stock handle"]} />}>
            <Route path="/stock" element={<StockListPage />} />
            <Route path="/stock/items" element={<ItemsPage />} />
            <Route path="/stock/lost" element={<LostStockPage />} />
          </Route>

          {/* PROGRAM */}
          <Route element={<ProtectedRoute roles={["program handle"]} />}>
            <Route path="/program" element={<Program />} />
          </Route>

          {/* USER */}
          <Route element={<ProtectedRoute roles={["user handle"]} />}>
            <Route path="/user" element={<UserList />} />
          </Route>

          {/* ALL HANDLE */}
          <Route element={<ProtectedRoute roles={["all handle"]} />}>
            <Route path="/active/year" element={<ActiveYearList />} />
          </Route>

          {/* SAHACHARI */}
          <Route element={<ProtectedRoute roles={["sahachari handle"]} />}>
            <Route path="/sahachari" element={<Sahachari />} />
            <Route path="/sahachari/users" element={<SahachariUsers />} />
          </Route>
        </Route>

        {/* Catch-all 404 Page (with Header) */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}