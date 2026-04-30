import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { signoutSuccess } from "../../redux/user/userSlice";
import { profileSignOut } from "../../redux/profile/profileSlice";
import AnimateHeight from "react-animate-height";
import MainLogo from "../../assets/MainLogo.png";
import {
  BookOutlined,
  Inbox,
  Mail,
  TableChart,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import IconCashBanknotes from "../Icon/IconCashBanknotes";
import IconCreditCard from "../Icon/IconCreditCard";
import IconDollarSign from "../Icon/IconDollarSign";
import IconCaretDown from "../Icon/IconCaretDown";
import IconCaretsDown from "../Icon/IconCaretsDown";
import IconMenuDashboard from "../Icon/IconMenuDashboard";
import IconMinus from "../Icon/IconMinus";

const Sidebar = ({ showSidebar, handleSidebar }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [currentMenu, setCurrentMenu] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  const location = useLocation();
  const dispatch = useDispatch();

  const toggleMenu = (value) => {
    setCurrentMenu((oldValue) => {
      return oldValue === value ? "" : value;
    });
  };

  useEffect(() => {
    const selector = document.querySelector(
      `.sidebar ul a[href="${window.location.pathname}"]`
    );
    if (selector) {
      selector.classList.add("active");
      const ul = selector.closest("ul.sub-menu");
      if (ul) {
        let ele = ul.closest("li.menu").querySelectorAll(".nav-link") || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      handleSidebar();
    }
  }, [location, handleSidebar]);

  const handleSignOut = async () => {
    try {
      const res = await axios.post(`${apiUrl}/users/signout`);
      const data = res.data;
      if (data.success === false) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess(data));
        dispatch(profileSignOut(data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {currentUser && (
        <nav
          className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] bg-blue-800 z-50 transition-all duration-300 ${showSidebar ? `left-[0]` : `left-[-260px] `
            }`}
        >
          <div className="bg-white dark:bg-black h-full">
            <div className="flex justify-between items-center px-4 py-3">
              <NavLink to="/" className="main-logo flex items-center shrink-0">
                <img
                  className="w-8 ml-[5px] flex-none"
                  src={MainLogo}
                  alt="logo"
                />
                <span className="text-2xl ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">
                  {"Bluebird"}
                </span>
              </NavLink>

              <button
                type="button"
                className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                onClick={handleSidebar}
              >
                <IconCaretsDown className="m-auto rotate-90" />
              </button>
            </div>
            <div className="h-[calc(100vh-80px)] relative overflow-auto scrollbar-thin scrollbar-thumb-gray-500/50 scrollbar-thumb-rounded-full">
              <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                <li className="menu nav-item">
                  <button
                    type="button"
                    className={`${currentMenu === "dashboard" ? "active" : ""
                      } nav-link group w-full`}
                    onClick={() => toggleMenu("dashboard")}
                  >
                    <div className="flex items-center">
                      <IconMenuDashboard className="group-hover:!text-primary shrink-0" />
                      <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                        {"dashboard"}
                      </span>
                    </div>

                    <div
                      className={
                        currentMenu !== "dashboard"
                          ? "rtl:rotate-90 -rotate-90"
                          : ""
                      }
                    >
                      <IconCaretDown />
                    </div>
                  </button>

                  <AnimateHeight
                    duration={300}
                    height={currentMenu === "dashboard" ? "auto" : 0}
                  >
                    <ul className="sub-menu text-gray-500">
                      <li>
                        <NavLink to="/">{"Analytics"}</NavLink>
                      </li>
                      <li>
                        <NavLink to="/timeline">{"Timeline"}</NavLink>
                      </li>
                      {(currentUser?.user.user_type === "Leader" ||
                        currentUser?.user.user_type === "Admin") && (
                          <li>
                            <NavLink to="/financev2">{"Finance"}</NavLink>
                          </li>
                        )}
                    </ul>
                  </AnimateHeight>
                </li>

                <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                  <IconMinus className="w-4 h-5 flex-none hidden" />
                  <span>{"functions"}</span>
                </h2>

                <li className="nav-item">
                  <ul>
                    <li className="nav-item">
                      <NavLink to="/opportunities" className="group">
                        <div className="flex items-center">
                          <TableChart className="group-hover:!text-primary shrink-0" />
                          <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                            {"Opportunities"}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/project" className="group">
                        <div className="flex items-center">
                          <Inbox className="group-hover:!text-primary shrink-0" />
                          <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                            {"Projects"}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/mission" className="group">
                        <div className="flex items-center">
                          <Mail className="group-hover:!text-primary shrink-0" />
                          <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                            {"Missions"}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/userManual" className="group">
                        <div className="flex items-center">
                          <BookOutlined className="group-hover:!text-primary shrink-0" />
                          <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                            {"Occupancy"}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                  </ul>
                </li>

                <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                  <IconMinus className="w-4 h-5 flex-none hidden" />
                  <span>{"finance"}</span>
                </h2>

                {(currentUser?.user.user_type === "Leader" ||
                  currentUser?.user.user_type === "Admin") && (
                    <li className="nav-item">
                      <ul>
                        <li className="nav-item">
                          <NavLink to="/purchaseOrder" className="group">
                            <div className="flex items-center">
                              <IconCashBanknotes className="group-hover:!text-primary shrink-0" />
                              <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                                {"Purchase Order"}
                              </span>
                            </div>
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink to="/extension" className="group">
                            <div className="flex items-center">
                              <IconCreditCard className="group-hover:!text-primary shrink-0" />
                              <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                                {"Extension"}
                              </span>
                            </div>
                          </NavLink>
                        </li>

                        {(currentUser?.user.user_type === "Admin") &&(
                        <li className="nav-item">
                          <NavLink to="/forecast" className="group">
                            <div className="flex items-center">
                              <IconDollarSign className="group-hover:!text-primary shrink-0" />
                              <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                                {"Forecast"}
                              </span>
                            </div>
                          </NavLink>
                        </li>
                        )}

                        {/* <li className="nav-item">
                        <NavLink to="/stats" className="group">
                          <div className="flex items-center">
                            <TimelineIcon className="group-hover:!text-primary shrink-0" />
                            <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                              {"Statistics"}
                            </span>
                          </div>
                        </NavLink>
                      </li> */}
                      </ul>
                    </li>
                  )}

                <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                  <IconMinus className="w-4 h-5 flex-none hidden" />
                  <span>{"customers"}</span>
                </h2>

                  {(currentUser?.user.user_type === "Admin" || currentUser?.user.user_type === "Leader") && (
                    <li className="nav-item">
                    <ul>
                      <li className="nav-item">
                        <NavLink to="/customers" className="group">
                          <div className="flex items-center">
                            <ContactPhoneIcon className="group-hover:!text-primary shrink-0" />
                            <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                              {"Customers"}
                            </span>
                          </div>
                        </NavLink>
                      </li> 
                    </ul>
                  </li>
                  )}
               
                  <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                    <IconMinus className="w-4 h-5 flex-none hidden" />
                    <span>{"user"}</span>
                  </h2>
           
                <li className="nav-item">
                  <ul>
                    {(currentUser?.user.user_type === "Admin") && (
                      <li className="nav-item">
                        <NavLink to="/users" className="group">
                          <div className="flex items-center">
                            <VerifiedUserIcon className="group-hover:!text-primary shrink-0" />
                            <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                              {"Users"}
                            </span>
                          </div>
                        </NavLink>
                      </li>
                    )}
                    <li
                      component="button"
                      className="nav-item hover:cursor-pointer"
                      type="submit"
                      onClick={handleSignOut}
                    >
                      <NavLink className="group">
                        <div className="flex items-center">
                          <LogoutIcon className="group-hover:!text-primary shrink-0" />
                          <span className="pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                            {"Sign Out"}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};
export default Sidebar;
