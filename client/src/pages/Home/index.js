import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Table from "../Table/OppTable";
import ResponsiveTable from "../Table/ProjectTable";
import MissionTable from "../Table/MissionTable";
import UserTable from "../Table/UserTable";
import Profile from "../Profile";
import DashboardPage from "../Dashboard";
import { ToastContainer } from "react-toastify";

const Home = ({ selectedOption, handleSidebar, showOverlay }) => {

  const location = useLocation();
  const navigate = useNavigate();
  // const urlParams = new URLSearchParams(location); 
  console.log(location.pathname);

  const renderComponent = () => {
    switch (selectedOption) {
      case "dashboard":
        return <DashboardPage />;
      case "projects":
        return <ResponsiveTable />;
      case "mission":
        return <MissionTable />;
      case "opportunities":
        return <Table />;
      case "user":
        return <UserTable />;
      case "profile":
        return <Profile />;
      default:
        return <Table />;
    }
  };

  return (
    <>
      <div
        className={`overlay ${showOverlay ? "active" : ""}`}
        onClick={handleSidebar}
      ></div>
      <div className="bg-gray-200 flex flex-col justify-center items-start h-fit">
        <ToastContainer />
        <div className="w-full p-6">{renderComponent()}</div>
      </div>
    </>
  );
};

export default Home;
