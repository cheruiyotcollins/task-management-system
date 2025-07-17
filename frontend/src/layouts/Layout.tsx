import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer"; // You'll need to create this or move your footer component here

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet /> {/* This renders your route components */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
