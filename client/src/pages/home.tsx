import { FC } from "react";
import Sidebar from "@/components/ui/sidebar";
import Dashboard from "@/pages/dashboard";

const Home: FC = () => {
  return (
    <div className="flex min-h-screen bg-neutral-100">
      <Sidebar />
      <Dashboard />
    </div>
  );
};

export default Home;
