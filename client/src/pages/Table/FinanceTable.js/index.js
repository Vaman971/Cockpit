import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../axios";
import ReactPaginate from "react-paginate";
import ExpenseUpdate from "../../../components/Modal/Update/FinanceUpdate";
import EditNote from "@mui/icons-material/EditNote";
import ExpenseModal from "../../../components/Modal/FinanceModal";

const FinanceTable = () => {
  const [data, setData] = useState([]);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [financeModal, setFinanceModal] = useState(false);
  const [financeId, setFinanceId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [query, setQuery] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  

  const [currentItems, setCurrentItem] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setpageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  // Fetch finance data from backend
  useEffect(() => {
    fetchData();
  }, [
    currentPage,
    query,
    selectedType,
    selectedStatus,
    financeModal,
    isActionModalOpen,
  ]);

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItem(data.slice(itemOffset, endOffset));
    setpageCount(Math.ceil(data.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, data]);

  const handlePageClick = (e) => {
    const newOffset = e.selected * itemsPerPage;
    setItemOffset(newOffset); // Update item offset
    setCurrentPage(e.selected);
  };

  const fetchData = async () => {
    try {
      const res = await api.get(`/expense/getExpenses`, {
        withCredentials: true,
      });
      const responseData = res.data;

      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        let filteredData = responseData;

        // Apply filters
        if (query) {
          filteredData = filteredData.filter(
            (item) =>
              item.expenseDescription &&
              item.expenseDescription
                .toLowerCase()
                .includes(query.toLowerCase())
          );
        }
        if (selectedType) {
          filteredData = filteredData.filter(
            (item) => item.expenseType === selectedType
          );
        }
        if (selectedStatus) {
          filteredData = filteredData.filter(
            (item) => item.expenseStatus === selectedStatus
          );
        }

        setData(filteredData);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const toggleActionModal = (id) => {
    setFinanceId(id);
    setIsActionModalOpen(!isActionModalOpen);
  };

  const handleFinanceModal = () => {
    fetchData();
    setFinanceModal(false);
  };

  // Handle dropdown filter changes
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const formatFinanceId = (id) => {
    if (id === "-") {
      return "-";
    }
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `FN-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="text-3xl font-bold text-blue-800 mb-4 ">Expenses</p>
      <div className="flex items-center justify-between space-x-4 py-4">
        <div className="relative h-fit">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none justify-center">
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
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="Search for Mission Id"
          />
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="block w-40 py-2 text-gray-700 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Salary">Salary</option>
            <option value="Trip">Trip</option>
            <option value="IT">IT</option>
            <option value="Service">Service</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="block w-40 py-2 text-gray-700 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Invalid">Invalid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
        {(currentUser.user.user_type === "Leader" ||
          currentUser.user.user_type === "Admin") && (
          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setFinanceModal(true)}
          >
            Add Expense
          </button>
        )}
      </div>
      <table className="w-full border border-gray-200 divide-y divide-gray-200">
        {/* Table headers */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense Id
            </th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense Description
            </th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense Type
            </th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense Amount
            </th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense Status
            </th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense Date
            </th>
            {(currentUser.user.user_type === "Leader" ||
              currentUser.user.user_type === "Admin") && (
              <th scope="col" className="px-6 py-3 text-center">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentItems &&
            currentItems.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span>{formatFinanceId(expense.id)}</span>{" "}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {expense.expenseDescription}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {expense.expenseType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {expense.expenseAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {expense.expenseStatus}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {expense.expenseDate}
                </td>
                {(currentUser.user.user_type === "Leader" ||
                  currentUser.user.user_type === "Admin") && (
                  <td className="text-center">
                    <button
                      className="text-blue-600 dark:text-blue-500 hover:underline"
                      onClick={() => toggleActionModal(expense.id)}
                    >
                      <EditNote />
                    </button>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>

      {currentItems && (
        <div className="mt-4 flex justify-end items-center gap-8">
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

      {/* Modals */}
      {isActionModalOpen && (
        <ExpenseUpdate
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          financeId={financeId}
        />
      )}

      {financeModal && (
        <ExpenseModal isOpen={financeModal} onClose={handleFinanceModal} />
      )}
    </div>
  );
};

export default FinanceTable;
