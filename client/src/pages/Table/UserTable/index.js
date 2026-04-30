import React, { useState, useEffect } from "react";
import UserModal from "../../../components/Modal/UserModal";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactPaginate from "react-paginate";
import UserUpdate from "../../../components/Modal/Update/UserUpdateModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserTable = () => {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("All"); // Default to show all users
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [currentItems, setCurrentItem] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setpageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItem(data.slice(itemOffset, endOffset));
    setpageCount(Math.ceil(data.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, data]);

  const handlePageClick = (e) => {
    const newOffset = e.selected * itemsPerPage;
    setItemOffset(newOffset);
    setCurrentPage(e.selected);
  };

  const handleUserProfile = (id) => {
    if (id) {
      navigate(`/users/profile/${id}`);
    } else {
      console.error("User ID is undefined");
    }
  }

  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/users/getusers`, {
        withCredentials: true,
      });
      const responseData = res.data;

      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        let filteredData = responseData;

        // Apply search filter
        if (searchQuery) {
          filteredData = filteredData.filter((item) =>
            item.username.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply user type filter
        if (userTypeFilter !== "All") {
          filteredData = filteredData.filter(
            (item) => item.user_type === userTypeFilter
          );
        }

        setData(filteredData);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isActionModalOpen, userModal, currentPage, searchQuery, userTypeFilter]);

  const toggleActionModal = (id) => {
    setUserId(id);
    setIsActionModalOpen(!isActionModalOpen);
  };

  const handleUserModal = () => {
    fetchData();
    setUserModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="text-3xl font-bold text-blue-800 mb-4">Users</p>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between flex-column md:flex-row flex-wrap mx-4 space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900">
          <div className="relative  flex justify-between w-full">
            <div className="relative ml-4">
              <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="table-search-users"
                className="block pt-2 ps-10 text-sm w- text-gray-900 border border-gray-300 rounded-lg  bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for username"
              />
            </div>
            <div className="flex gap-4 items-center">
              <label
                htmlFor="userTypeFilter"
                className="text-lg font-medium text-nowrap text-blue-800"
              >
                User Type:
              </label>
              <select
                id="userTypeFilter"
                className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Leader">Leader</option>
                <option value="Reader">Reader</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="relative mr-4">
              <button
                id="actionButton"
                className="inline-flex items-center text-white bg-blue-800 border border-gray-300 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-blue-700 dark:focus:ring-blue-700 ml-6"
                type="button"
                onClick={() => setUserModal(true)}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                User name
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Burden Rate
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems &&
              currentItems.map((item) => (
                <tr
                  key={item.user_id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-center"
                >
                  <td className="px-6 py-4 cursor-pointer"
                    onClick={() => window.open(`/users/profile/${item.user_id}`, "_blank")}>
                    {item.username}
                  </td>

                  <td className="px-6 py-4">{item.email}</td>
                  <td className="px-6 py-4">{item.user_type}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`badge text-center ${item.active
                        ? "badge-outline-primary"
                        : "badge-outline-danger"
                        }`}
                    >
                      {" "}
                      {item.active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.burden_rate || "-"}</td>
                  <td>
                    <button
                      className="text-blue-600 dark:text-blue-500 hover:underline"
                      onClick={() => toggleActionModal(item.user_id)}
                    >
                      <EditNoteIcon />
                    </button>
                    {/* <button
                       className="text-blue-600 dark:text-blue-500 hover:underline">
                      <DeleteIcon/>
                    </button> */}
                    {/* Render the action modal based on state */}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {isActionModalOpen && (
          <UserUpdate
            isOpen={isActionModalOpen}
            onClose={() => setIsActionModalOpen(false)}
            userId={userId}
          />
        )}
        {userModal && (
          <UserModal isOpen={userModal} closeModal={handleUserModal} />
        )}
      </div>
      {currentItems && (
        <div className="mt-4 flex justify-between items-center gap-8">
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            Showing {itemOffset + 1} to{" "}
            {Math.min(itemOffset + itemsPerPage, data.length)} of {data.length} items
          </span>
          <ReactPaginate
            previousLabel={"←"}
            nextLabel={"→"}
            breakLabel={"..."}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            previousLinkClassName={"pagination__link"}
            nextLinkClassName={"pagination__link"}
            disabledClassName={"pagination__link--disabled"}
            activeClassName={"pagination__link--active"}
          />
        </div>
      )}
    </div>
  );
};

export default UserTable;
