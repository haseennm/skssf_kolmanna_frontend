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



export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/ledger/category" element={<LedgerCategoryList />} />
        <Route path="/stock" element={<StockListPage />} />
        <Route path="/stock/items" element={<ItemsPage />} />
        <Route path="/stock/lost" element={<LostStockPage />} />
        <Route path="/program" element={<Program />} />
        <Route path="/user" element={<UserList />} />
        <Route path="/active/year" element={<ActiveYearList />} />
        <Route path="/sahachari" element={<Sahachari />} />
        <Route path="/sahachari/users" element={<SahachariUsers />} />
        <Route path="/sahachari/items" element={<SahachariItems />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}