import React, { useState, useEffect } from "react";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ReactPaginate from "react-paginate";
import api from "../../../axios";
import { toast } from "react-toastify";
import AddCustomer from "../../../components/Modal/CustomerModal";
import CustomerUpdateModal from "../../../components/Modal/Update/CustomerUpdateModal";


const CustomerTable = () => {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [data, setData] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("All"); // Default to show all users
  
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

  const fetchData = async () => {
    try {
      const res = await api.get(`/customer/getAllCustomers`, {
        withCredentials: true,
      });
      const responseData = res.data;
      console.log(responseData);

      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        let filteredData = responseData;

      // Apply search filter
      if (searchQuery) {
        const lowercasequery = searchQuery.toLowerCase();
        filteredData = filteredData.filter((item) =>
          item.first_name?.toLowerCase().includes(lowercasequery) ||
          item.last_name?.toLowerCase().includes(lowercasequery) ||
          item.email?.toLowerCase().includes(lowercasequery)
        );
      }

      // Apply user type filter if needed in the future
      // if (userTypeFilter !== "All") {
      //   filteredData = filteredData.filter(
      //     (item) => item.user_type === userTypeFilter
      //   );
      // }

      setData(filteredData);
    }}
    catch (error) {
      console.log(error.message);
    };
  }
  useEffect(() => {
    fetchData();
  }, [showModal, isActionModalOpen, customerModal, currentPage, searchQuery, userTypeFilter]);

  const toggleActionModal = (id) => {
    setCustomerId(id);
    setIsActionModalOpen(!isActionModalOpen);
  };

  const handleCustomerModal = () => {
    fetchData();
    setCustomerModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="text-3xl font-bold text-blue-800 mb-4">Customers</p>
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
                className="block pt-2 ps-10 text-sm w-80 text-gray-900 border border-gray-300 rounded-lg  bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for customername"
              />
            </div>
            <div className="relative mr-4">
              <button
                id="actionButton"
                className="inline-flex items-center text-white bg-blue-800 border border-gray-300 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-blue-700 dark:focus:ring-blue-700 ml-6"
                type="button"
                onClick={() => setCustomerModal(true)}
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                Customer name
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Contact No
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Site
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Siglum
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Point of Contact
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
                  <td className="px-6 py-4"
                   onClick={() => window.open(`/customerDetails/${item.customer_id}`, "_blank")}>
                    {item.first_name} {item.last_name}</td>
                  <td className="px-6 py-4">{item.email}</td>
                  <td className="px-6 py-4">{item.phone}</td>
                  <td className="px-6 py-4">{item.site}</td>
                  <td className="px-6 py-4">{item.siglum}</td>
                  <td className="px-6 py-4">{item.contactpoint|| "-"}</td>
                  <td>
                    <button
                      className="text-blue-600 dark:text-blue-500 hover:underline"
                      onClick={() => toggleActionModal(item.customer_id)}
                    >
                      <EditNoteIcon />
                    </button>
                  </td>
                </tr>
                
              ))}
          </tbody>
        </table>
        {isActionModalOpen && (
          <CustomerUpdateModal
            isOpen={isActionModalOpen}
            closeModal={() => setIsActionModalOpen(false)}
            customerId={customerId}
          />
        )}
        {customerModal && (
          <AddCustomer isOpen={customerModal} closeModal={handleCustomerModal} />
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
export default CustomerTable;
