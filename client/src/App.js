import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from './axios';
import ResponsiveTable from "./pages/Table/ProjectTable";
import MissionTable from "./pages/Table/MissionTable";
import Table from "./pages/Table/OppTable";
import Navbar from "./components/Navbar/Navbar";
import Profile from "./pages/Profile";
import UserTable from "./pages/Table/UserTable";
import DashboardPage from "./pages/Dashboard";
import FooterComp from "./components/Footer";
import Sidebar from "./components/Sidebar/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import LoginBoxed from "./pages/BoxedSignIn";
import Layout from "./components/Layout";
import GanttChart from "./components/GanttChart";
import Finance_v2 from "./pages/Finance_v2"
import PurchaseOrderTable from "./pages/Table/PurchaseOrder";
import { signoutSuccess } from "./redux/user/userSlice";
import { profileSignOut } from "./redux/profile/profileSlice";
import ResetPassword from "./components/ResetPassword";
import FinanceTable from "./pages/Table/FinanceTable.js";
import Finance from "./pages/Finance/index.js";
import ForecastTable from "./pages/Table/ForecastTable/index.js";
import RevenueTable from "./pages/Table/RevenueTable/index.js";
import UserManual from "./pages/Table/userManual";
import UserProfile from "./pages/UserProfile";
// import TeamStats from "./pages/Table/TeamStats/index.js";
import SessionTimeoutModal from "./components/Modal/SessionTimeOut";
import { Spinner } from "flowbite-react";
import ExtentionTable from "./pages/Table/ExtentionTable";
import MissionPage from "./pages/MissionPage";
import OpportunityPage from "./pages/OverviewPage";
import CustomerTable from "./pages/Table/CustomerTable";
import CustomerDetailsPage from "./pages/CustomerDetailsPage/index.js";
import SharePointPage from "./pages/SharePointPage";

function App() {
  const { currentUser } = useSelector((state) => state.user);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [icon, setIcon] = useState(showSidebar);
  const [autoSignOut, setAutoSignOut] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

  const handleSidebar = useCallback(() => {
    setShowSidebar((prev) => !prev);
    setIcon((prev) => !prev);
    setShowOverlay((prev) => !prev);
  }, []);

  const handleSignOut = async () => {
    try {
      await api.post('/auth/signOut');
      setShowModal(false);
      dispatch(signoutSuccess());
      dispatch(profileSignOut());
      window.location.href = '/sign-in';
    } catch (error) {
      // Even if the server call fails, clear local state and redirect
      setShowModal(false);
      dispatch(signoutSuccess());
      dispatch(profileSignOut());
      window.location.href = '/sign-in';
    }
  };

  useEffect(() => {
    const checkTokenExpiry = () => {
      if (currentUser && currentUser.tokenExpiry) {
        const remainingTime = new Date(currentUser.tokenExpiry) - new Date();
        setRemainingTime(remainingTime);
        if (remainingTime <= 0) {
          setAutoSignOut(true);
        } else if (remainingTime <= 5 * 60 * 1000 && remainingTime > 0) {
          // Show modal warning instead of blocking alert()
          setShowModal(true);
        }
      }
    };

    checkTokenExpiry();
    const intervalId = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(intervalId);
  }, [currentUser?.tokenExpiry]);

  useEffect(() => {
    const authCheck = async () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };
    authCheck();
  }, []);

  useEffect(() => {
    if (autoSignOut) {
      setShowModal(true);
      setAutoSignOut(false);
    }
  }, [autoSignOut]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Spinner size="lg" />
        <span className="pl-3">Loading...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {currentUser && currentUser.user.active && (
        <>
          <Navbar onToggleSidebar={handleSidebar} icon={icon} />
          <Sidebar showSidebar={showSidebar} handleSidebar={handleSidebar} />
        </>
      )}
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route element={<Layout handleSidebar={handleSidebar} showOverlay={showOverlay} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/opportunities" element={<Table />} />
            <Route path="/project" element={<ResponsiveTable />} />
            <Route path="/mission" element={<MissionTable />} />
            <Route path="/purchaseOrder" element={<PurchaseOrderTable />} />
            <Route path="/customers" element={<CustomerTable/>}/>
            <Route path="/users" element={<UserTable />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/timeline" element={<GanttChart />} />
            <Route path="/financev2" element={<Finance_v2/>} />
            <Route path="/expense" element={<FinanceTable />} />
            <Route path="/forecast" element={<ForecastTable />} />
            <Route path="/revenue" element={<RevenueTable />} />
            <Route path="/extention" element={<ExtentionTable />} />
            <Route path="/userManual" element={<UserManual />} />
            <Route path="/mission-details/:missionId" element={<MissionPage />} />
            <Route path="/opportunity-details/:opportunityId" element={<OpportunityPage/>}/>
            <Route path="/purchaseOrder/:id" element={<PurchaseOrderTable/>}/>
            <Route path="missionPage/teamModal/:id" element={<MissionTable/>}/>
            <Route path="/forecast/:id" element={<ForecastTable/>}/>
            <Route path="/customerDetails/:id" element={<CustomerDetailsPage/>}/>
            <Route path="/sharePoint" element={<SharePointPage/>}/>
            <Route path="/missionPage/linkModal/:id" element={<MissionTable/>}/>
 

            <Route path="/users/profile/:id" element={<UserProfile />} />
            {/* <Route path="/stats" element={<TeamStats />} /> */}
          </Route>
        </Route>
        <Route path="/sign-in" element={<LoginBoxed />} />
        <Route path="/resetPassword/:id" element={<ResetPassword />} />
      </Routes>
      {currentUser && currentUser.user.active && <FooterComp />}
      <SessionTimeoutModal showModal={showModal} onClose={handleSignOut} />
    </BrowserRouter>
  );
}

export default App;
