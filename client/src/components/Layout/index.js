import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
 
const Layout = ({ handleSidebar, showOverlay }) => {
  const { currentUser } = useSelector((state) => state.user);
  return (
      currentUser? (
        <>
          <div
            className={`overlay ${showOverlay ? "active" : ""}`}
            onClick={handleSidebar}
          ></div>
          <div className="bg-gray-200 flex flex-col justify-center items-start h-fit">
            <ToastContainer />
            <div className="w-full p-6">
              <Outlet />
            </div>
          </div>
        </>
      ) : (
        <Navigate to="/sign-in" />
      )
  );
};
 
export default Layout;