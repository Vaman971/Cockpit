import React, { useEffect, useState } from "react";
import MainLogo from "../../assets/MainLogo.png";
import {
   FeedbackTwoTone
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { signoutSuccess } from "../../redux/user/userSlice";
import { profileSignOut } from "../../redux/profile/profileSlice";
import { Link,  useLocation } from "react-router-dom";
import IconMenu from "../Icon/IconMenu";
import Dropdown from "../Dropdown";
import IconUser from "../Icon/IconUser";
import IconLogout from "../Icon/IconLogout";
import api from "../../axios";
import { Button } from "@mui/material";

const Navbar = ({ onToggleSidebar }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [profileData, setProfileData] = useState({});
  const [error, setError] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (profileData && profileData.profileImage) {
      // Assuming profileImage is base64 encoded string
      setProfileImage(`data:image/png;base64, ${profileData.profileImage}`);
    }
  }, [profileData, currentUser.user.username]);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const res = await api.get(
          `/profile/getProfile/${currentUser.user.username}`,
          { withCredentials: true }
        );
        const profileData = res.data.userProfile;

        if (profileData.success === false) {
          console.log(profileData.message);
        } else {
          setProfileData(profileData);
        }
      } catch (error) {
        setError(true);
      }
    };
    getProfileData();
  }, [currentUser.user.username]);

  useEffect(() => {
    const selector = document.querySelector(
      'ul.horizontal-menu a[href="' + window.location.pathname + '"]'
    );
    if (selector) {
      selector.classList.add("active");
      const all = document.querySelectorAll(
        "ul.horizontal-menu .nav-link.active"
      );
      for (let i = 0; i < all.length; i++) {
        all[0]?.classList.remove("active");
      }
      const ul = selector.closest("ul.sub-menu");
      if (ul) {
        let ele = ul.closest("li.menu").querySelectorAll(".nav-link");
        if (ele) {
          ele = ele[0];
          setTimeout(() => {
            ele?.classList.add("active");
          });
        }
      }
    }
  }, [location]);

  const handleSignOut = async () => {
    try {
      const res = await api.post(`/users/signout`);
      const data = res.data;
      if (data.success === false) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess(data));
        dispatch(profileSignOut(data));
      }
    } catch (error) {
      // setError(true);
      console.log(error);
    }
  };

  return (
    <header className={`z-40 sticky top-0`}>
      <div className="shadow-sm">
        <div className="flex justify-between items-center bg-white z-10 navbar">
          <div className="relative bg-white flex w-full items-center px-5 py-2.5 dark:bg-black">
            <div className="horizontal-logo flex justify-between items-center mr-2 rtl:ml-2">
              <Link to="/" className="main-logo flex items-center shrink-0">
                <img
                  className="w-8 -ml-1 rtl:-mr-1 inline"
                  src={MainLogo}
                  alt="logo"
                />
                <span className="text-2xl ml-1.5 rtl:mr-1.5  font-semibold  align-middle hidden md:inline dark:text-white-light transition-all duration-300">
                  Bluebird
                </span>
              </Link>
              <button
                type="button"
                className="collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                onClick={onToggleSidebar}
              >
                <IconMenu className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="sm:ml-0 mr-5 ml-auto flex items-center space-x-1.5 lg:space-x-2 dark:text-[#d0d2d6]">
            <div className="dropdown shrink-0 flex space-x-4 items-center">
              <Dropdown
                offset={[-10, 8]}
                placement={`${"bottom-end"}`}
                btnClassName="relative group block"
                button={
                  <img
                    className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100"
                    src={profileImage ? profileImage : "./UserProfile.png"}
                    alt="userProfile"
                  />
                }
              >
                <ul className="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
                  <li>
                    <div className="flex items-center px-4 py-4">
                      <img
                        className="rounded-md w-10 h-10 object-cover"
                        src={profileImage ? profileImage : "./UserProfile.png"}
                        alt="userProfile"
                      />
                      <div className="pl-4 rtl:pr-4 truncate">
                        <h4 className="text-base">
                          {currentUser.user.username}
                          <span className="text-xs bg-success-light rounded text-success px-1 ml-2 rtl:ml-2">
                            {currentUser.user.user_type}
                          </span>
                        </h4>
                        <button
                          type="button"
                          className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white"
                        >
                          {currentUser.user.email}
                        </button>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link to={`/users/profile/${currentUser.user.user_id}`} className="dark:hover:text-white">
                      <IconUser className="w-4.5 h-4.5 mr-2 rtl:ml-2 shrink-0" />
                      Profile
                    </Link>
                  </li>
                  <li className="border-t border-white-light dark:border-white-light/10">
                    <Button
                      className="text-danger !py-3"
                      onClick={handleSignOut}
                    >
                      <IconLogout className="w-4.5 h-4.5 mr-2 rtl:ml-2 rotate-90 shrink-0" />
                      Sign Out
                    </Button>
                  </li>
                </ul>
              </Dropdown>
              <Link to='https://tatatechnologies.sharepoint.com/sites/Bluebird9-M105/_layouts/15/listforms.aspx?cid=YmNlNjI1YjItZGI5OS00OWQ3LWEzMjktYjZiNTQ5M2Y4OTYz&nav=N2RhMDQ3NmEtYjBmZC00YmNmLTk0YjUtOWJlYWVlNzdmNGU0' target='_blank'>
                <Button className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full">
                  <FeedbackTwoTone className="w-5 h-5 mr-2" />
                  Feedback
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
