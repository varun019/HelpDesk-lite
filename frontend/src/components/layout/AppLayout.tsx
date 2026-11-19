import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="md:pl-64">
        <Header />

        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;