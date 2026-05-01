import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ForcastModal from "../../../components/Modal/ForcastModal";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ForcastUpdate from "../../../components/Modal/Update/ForcastUpdate";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { useSelector } from "react-redux";
import api from "../../../axios";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const ForecastTable = () => {
  const { id } = useParams();
  const [targetRowIndex, setTargetRowIndex] = useState(null);
  const rowRef = useRef([]);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [forcastModal, setForcastModal] = useState(false);
  const [forcastId, setForcastId] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [currentItems, setCurrentItem] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setpageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  
  const itemsPerPage = 20;

  const regionOptions = [
    { value: "FR", label: "France" },
    { value: "DE", label: "Germany" },
    { value: "UK", label: "United Kingdom" },
    { value: "IN", label: "India" },
    { value: "ES", label: "Spain" },
    { value: "NA", label: "Other" },
  ];

  const clusterOptions = [
    { value: "SNPS", label: "S&PS" },
    { value: "MNT", label: "MNT" },
    { value: "MEBM", label: "MEBM" },
    { value: "Other", label: "Other" },
  ];

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      border: "2px solid gray",
      borderRadius: "0.375rem",
      padding: "0.25rem",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(29, 78, 216, 0.3)" : "none",
      "&:hover": {
        borderColor: "#1D4ED8",
      },
      backgroundColor: "transparent",
    }),
    input: (provided) => ({
      ...provided,
      color: "#1D4ED8",
      "& input": {
        boxShadow: "none",
        caretColor: "#1D4ED8", // Custom caret color
        outline: "none", // Remove outline to get rid of the blue box
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#DBEAFE",
      color: "#1D4ED8",
      fontWeight: "bold",
      borderRadius: "0.25rem",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#1D4ED8",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#1D4ED8",
      "&:hover": {
        backgroundColor: "#BFDBFE",
        color: "#1D4ED8",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9CA3AF",
      fontWeight: "bold",
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? "#1D4ED8" : "#9CA3AF",
      "&:hover": {
        color: "#1D4ED8",
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": {
        color: "#1D4ED8",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.375rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#DBEAFE" : "#FFFFFF",
      color: "#1D4ED8",
      "&:hover": {
        backgroundColor: "#DBEAFE",
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

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

  function getCurrencySymbol(currencyCode) {
    const currencySymbols = {
      EUR: '€',
      INR: '₹',
      USD: '$',
      RON: 'L',
      GBP: '£',
    };
    return currencySymbols[currencyCode] || ''; // Return symbol if found, or empty if not
  }

  const fetchData = async () => {
    try {
      const res = await api.get(`/forecast/getAll`, {
        withCredentials: true,
      });

      const responseData = res.data;

      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        let filteredData = responseData;

        if (selectedCluster.length > 0) {
          const selectedClusterValues = selectedCluster.map(
            (cluster) => cluster.value
          );
          filteredData = filteredData.filter((item) =>
            selectedClusterValues.includes(item.cluster)
          );
        }
        if (selectedRegion.length > 0) {
          const selectedRegionValues = selectedRegion.map(
            (region) => region.value
          );
          filteredData = filteredData.filter((item) =>
            selectedRegionValues.includes(item.region)
          );
        }
        if (query) {
          filteredData = filteredData.filter(
            (data) =>
              data.forcastDescription &&
              data.forcastDescription
                .toLowerCase()
                .includes(query.toLowerCase())
          );
        }
        setData(filteredData);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const formatForcastId = (id) => {
    if (id === "-") {
      return "-";
    }
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `FR-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  const getMonthName = (exp) => {
    if (exp === "-") {
      return "-";
    }
    let newExp = exp.split("-");
    let year = newExp[0];
    let monthNumber = newExp[1];

    const date = new Date();
    date.setFullYear(year);

    date.setMonth(monthNumber - 1);
    return date.toLocaleString("en-US", { month: "short" }) + " " + year;
  };

  // Export data as CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(data, {
      header: true,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "forecast_data.csv");
  };

  const handleClusterChange = (selectedOptions) => {
    setSelectedCluster(selectedOptions);
  };

  const handleRegionChange = (selectedOptions) => {
    setSelectedRegion(selectedOptions);
  };

  useEffect(() => {
    fetchData(); // Call fetchData() only once when the component mounts
  }, [isActionModalOpen, currentPage, query, selectedCluster, selectedRegion]); // Empty dependency array means it runs only on mount
  const toggleActionModal = (id) => {
    setForcastId(id);
    setIsActionModalOpen(!isActionModalOpen);
  };

  useEffect(() => {
    if (id && data.length > 0) {
      const index = data.findIndex(row => row.id === Number(id));
      setTargetRowIndex(index % 20);
 
      if (index === 0) {
        setCurrentPage(0);
      } else {
        const pageNo = Math.ceil(index / 20);
        setCurrentPage(pageNo - 1);
      }
    }
  }, [id, data]);
 
  useEffect(() => {
    if (targetRowIndex !== null) {
      const rowOnPageIndex = targetRowIndex % 20;
 
      const targetRow = rowRef.current[rowOnPageIndex];
 
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
        targetRow.style.backgroundColor = "#BAE6FD";
        targetRow.style.transition = "background-color 3s ease";
      }
    }
  }, [targetRowIndex]);


  const handleForcastModal = () => {
    fetchData();
    setForcastModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center w-full">
        <p className="text-3xl font-bold text-blue-800 mb-4">Forecast</p>
        {(currentUser.user.user_type === "Leader" ||
          currentUser.user.user_type === "Admin") && (
            <div>
              <button
                id="actionButton"
                className="inline-flex items-center text-white bg-blue-800 border border-gray-300 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-blue-700 dark:focus:ring-blue-700 ml-8"
                type="button"
                onClick={() => setForcastModal(true)}
              >
                Add Forecast
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center text-white bg-green-500 border border-gray-300 focus:outline-none mx-1 hover:bg-green-700 focus:ring-4 focus:ring-green-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-green-400 dark:border-green-600 dark:hover:bg-gray-700 dark:hover:border-green-700 dark:focus:ring-green-700"
              >
                Export as CSV
              </button>
            </div>
          )}
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 mx-5 bg-white dark:bg-gray-900">
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
              placeholder="Search for Description"
            />
          </div>
          <div className="flex items-center gap-4">
            {/* <label
              htmlFor="selectedCluster"
              className="text-lg font-medium text-nowrap text-blue-800"
            >
              Cluster:
            </label> */}
            <Select
              id="selectedCluster"
              value={selectedCluster}
              onChange={handleClusterChange}
              options={clusterOptions}
              isMulti
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Cluster..."
            />
          </div>

          {/* Region Multi-select Dropdown */}
          <div className="flex items-center gap-4">
            {/* <label
              htmlFor="selectedRegion"
              className="text-lg font-medium text-nowrap text-blue-800"
            >
              Forecast Region:
            </label> */}
            <Select
              id="selectedRegion"
              value={selectedRegion}
              onChange={handleRegionChange}
              options={regionOptions}
              isMulti
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Region..."
            />
          </div>
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white max-h-[60vh]">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-[2]">
              <tr>
                <th scope="col" className="px-6 py-3 text-center">
                  Forecast Id
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Forecast Description
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Delivery Forecast
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center whitespace-nowrap"
                >
                  Sales Forecast
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center whitespace-nowrap"
                >
                  Planned Revenue (IPMS)
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  DP
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Forecast Month
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Remarks
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Region
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Cluster
                </th>
                {(currentUser.user.user_type === "Leader" ||
                  currentUser.user.user_type === "Admin") && (
                    <th scope="col" className="px-6 py-3 text-center">
                      Action
                    </th>
                  )}
              </tr>
            </thead>
            <tbody>
              {currentItems &&
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-center"
                    ref={(el) => (rowRef.current[index] = el)} 
                  >
                    <td className=" px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white text-center">
                      <div className="ps-3 ">
                        <div className="text-base font-semibold flex justify-center align-center">
                          <span
                            className={`badge ${Number(item.status) === 0
                                ? `badge-outline-warning`
                                : `badge-outline-success`
                              }  text-center`}
                          >
                            {formatForcastId(item.id)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className=" px-6 py-4 text-gray-900  dark:text-white text-center">
                      {item.forcastDescription || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {item.deliveryForcast || "NA"} {getCurrencySymbol(item.currencyCode)}
                    </td>
                    <td className="px-6 py-4">{item.salesForcast || "NA"} {getCurrencySymbol(item.currencyCode)}</td>
                    <td className="px-6 py-4">{item.revenueForcast || "NA"} {getCurrencySymbol(item.currencyCode)}</td>
                    <td className="px-6 py-4">
                      {item.dpValue || "Not specified"}
                    </td>
                    <td className="px-6 py-4">
                      {getMonthName(item.forcastDate || "-")}
                    </td>
                    <td className="px-6 py-4">{item.remark || "-"}</td>

                    <td className="px-6 py-4">{item.region}</td>
                    <td className="px-6 py-4">
                      {item.cluster || "Not specified"}
                    </td>
                    {(currentUser.user.user_type === "Leader" ||
                      currentUser.user.user_type === "Admin") && (
                        <td>
                          <button
                            className="text-blue-600 dark:text-blue-500 hover:underline"
                            onClick={() => toggleActionModal(item.id)}
                          >
                            <EditNoteIcon />
                          </button>
                        </td>
                      )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
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
            forcePage={currentPage}     
          />
        </div>
      )}

      {isActionModalOpen && (
        <ForcastUpdate
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          forcastId={forcastId}
        />
      )}

      {forcastModal && (
        <ForcastModal isOpen={forcastModal} onClose={handleForcastModal} />
      )}
    </div>
  );
};

export default ForecastTable;
