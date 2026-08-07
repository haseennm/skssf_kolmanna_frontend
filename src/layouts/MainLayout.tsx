import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function MainLayout() {
  return (
    <div className="w-full bg-last-50 dark:bg-last-800">
      <div className="min-h-screen max-w-400 mx-auto bg-neutral-100">
      <Header/>

      <main className=" dark:bg-last-800 h-screen ">
        <Outlet />
      </main>
    </div>
    </div>
  );
}