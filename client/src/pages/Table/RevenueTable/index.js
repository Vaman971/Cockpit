import React, { useState, useEffect } from "react";
import api from "../../../axios";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useSelector } from "react-redux";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RevenueUpdate from "../../../components/Modal/Update/RevenueUpdate";
import RevenueInvoiceDetails from "../../../components/Modal/RevenueInvoiceDetails";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import TotalSavings from "../../../components/Modal/TotalSavingsModal";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const RevenueTable = () => {
  const [data, setData] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [revenueId, setRevenueId] = useState(null); // Change to null initially
  const [query, setQuery] = useState("");
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control the edit modal
  const [isTotalSavingsOpen, setIsTotalSavingsOpen] = useState(false);
  const [selectedLeaders, setSelectedLeaders] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [extension, setExtension] = useState("");
  
  const itemsPerPage = 20;
  // console.log(extension)

  const regionOptions = [
    { value: "FR", label: "France" },
    { value: "DE", label: "Germany" },
    { value: "UK", label: "United Kingdom" },
    { value: "IN", label: "India" },
    { value: "ES", label: "Spain" },
    { value: "NA", label: "Other" },
  ];

  const extensionOptions = [
    { value: "extended", label: "Extended" },
    { value: "not_extended", label: "Not Extended" },
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
    fetchData();
    fetchLeaders();
  }, [
    currentPage,
    isEditModalOpen,
    isInvoiceDetailsOpen,
    query,
    selectedClusters,
    selectedLeaders,
    selectedRegion,
    selectedExtensions,
  ]);

  const fetchLeaders = async () => {
    try {
      const res = await api.get(`/users/getusers`, {
        withCredentials: true,
      });
      const responseData = res.data;
      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        setLeaders(
          responseData.filter(
            (user) => user.user_type === "Leader" || user.user_type === "Admin"
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchData = async () => {
    try {
      const res = await api.get(`/revenue/getRevenues`, {
        withCredentials: true,
      });
      const responseData = res.data;
      console.log(responseData);

      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        let filteredData = responseData.filter(
          (item) => item.active === true
        );

        if (query) {
          filteredData = filteredData.filter(
            (item) =>
              item.missionRevenue.airbusId &&
              item.missionRevenue.airbusId
                .toLowerCase()
                .includes(query.toLowerCase())
          );
        }

        if (selectedClusters.length > 0) {
          const selectedClusterValues = selectedClusters.map(
            (cluster) => cluster.value
          );
          filteredData = filteredData.filter((item) =>
            selectedClusterValues.includes(item.cluster)
          );
        }

        if (selectedLeaders.length > 0) {
          const selectedLeaderValues = selectedLeaders.map(
            (leader) => leader.value
          );
          filteredData = filteredData.filter((item) =>
            selectedLeaderValues.includes(item.missionRevenue.missionCardLeader)
          );
        }

        if (selectedRegion && selectedRegion.length > 0) {
          filteredData = filteredData.filter((item) =>
            selectedRegion.some((region) => region.value === item.region)
          );
        }

        if (selectedExtensions.length > 0) {
          const selectedExtensionValues = selectedExtensions.map(
            (ext) => ext.value
          );
          filteredData = filteredData.filter((item) =>
            selectedExtensionValues.includes(
              item.extension === "extended" ? "extended" : "not_extended"
            )
          );
        }

        setData(filteredData);
        setPageCount(Math.ceil(filteredData.length / itemsPerPage));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Export data as CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(data, {
      header: true,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "revenue_data.csv");
  };

  const handleLeaderChange = (selectedOptions) => {
    setSelectedLeaders(selectedOptions);
  };

  const handlePageClick = (e) => {
    setCurrentPage(e.selected);
  };

  const handleInvoiceDetails = (id, extension) => {
    setRevenueId(id);
    setExtension(extension);
    setIsInvoiceDetailsOpen(true);
  };

  const handleInvoiceClose = () => {
    setIsInvoiceDetailsOpen(false);
  };

  const handleRevenueClose = () => {
    setIsEditModalOpen(false);
  };

  const handleRevenueDetails = (id) => {
    setRevenueId(id);
    setIsEditModalOpen(true);
  };

  const handleClusterChange = (selectedOptions) => {
    setSelectedClusters(selectedOptions);
  };

  const handleTotalSavings = (id) => {
    setRevenueId(id);
    setIsTotalSavingsOpen(true);
  };

  const handleRegionChange = (selectedOptions) => {
    setSelectedRegion(selectedOptions);
  };

  const handleExtensionChange = (selectedOptions) => {
    setSelectedExtensions(selectedOptions);
  };

  const formatRevenueId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `RE-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  const formatMissionId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `MC-${"0".repeat(zerosCount)}${idString}`;
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center w-full">
        <p className="text-3xl font-bold text-blue-800 mb-4 ">Revenue</p>
        {(currentUser.user.user_type === "Leader" ||
          currentUser.user.user_type === "Admin") && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center text-white bg-green-500 border border-gray-300 focus:outline-none mx-1 hover:bg-green-700 focus:ring-4 focus:ring-green-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-green-400 dark:border-green-600 dark:hover:bg-gray-700 dark:hover:border-green-700 dark:focus:ring-green-700"
          >
            Export as CSV
          </button>
        )}
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-t-lg">
        <div className="flex items-center justify-between flex-column md:flex-row pl-[20px] pr-[20px] flex-wrap space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900 gap-8">
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
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
              placeholder="Search for Airbus Id"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              id="selectedLeaders"
              value={selectedLeaders}
              onChange={handleLeaderChange}
              options={leaders.map((leader) => ({
                value: leader.user_id,
                label: leader.username,
              }))}
              isMulti
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Leader..."
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              options={extensionOptions}
              isMulti
              placeholder="Extension..."
              value={selectedExtensions}
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              onChange={handleExtensionChange}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={customStyles}
            />
          </div>
          <div className="flex items-center gap-4">
            {/* <label
              htmlFor="selectedClusters"
              className="text-lg font-medium text-nowrap text-blue-800"
            >
              PO Cluster:
            </label> */}
            <Select
              id="selectedClusters"
              value={selectedClusters}
              onChange={handleClusterChange}
              options={[
                { value: "SNPS", label: "S&PS" },
                { value: "MEBM", label: "MEBM" },
                { value: "MNT", label: "MNT" },
                { value: "Other", label: "Other" },
              ]}
              isMulti
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Cluster..."
            />
          </div>
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
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white max-h-[60vh]">
        {/* Table Header */}
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-[2]">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                Revenue Id
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Airbus Mission ID
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Cluster
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Siglum
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Revenue Projection
                <br />
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Actual Revenue <br /> (Delivery)
              </th>
              {/* <th scope="col" className="px-6 py-3 text-center">
                Forecast Revenue <br/>  (Expected)
                </th> */}
              {/* <th scope="col" className="px-6 py-3 text-center">
                Revenue Month
              </th> */}
              <th scope="col" className="px-6 py-3 text-center">
                Total Savings
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                View Savings
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                View Projections
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
            {data &&
              data
                .slice(
                  currentPage * itemsPerPage,
                  (currentPage + 1) * itemsPerPage
                )
                .map((item) => (
                  <tr
                    key={item.id}
                    className={
                      item.extension === "extended" ? "bg-blue-100" : ""
                    }
                  >
                    <td className="px-6 py-4 text-center">
                      <span className="badge badge-outline-info whitespace-nowrap">
                        {formatRevenueId(item.id)}
                      </span>
                    </td>
                    <td className="text-sm font-medium text-gray-400 flex justify-center items-center whitespace-nowrap ">
                      {item.missionRevenue.airbusId || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item?.revenueDescription || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item?.cluster || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item?.siglum || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {Math.round(item?.plannedRevenue) || "-"} &euro;
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {Math.round(item?.actualRevenue) || "-"} &euro;
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {item?.forecastRevenue || "-"}
                    </td> */}

                    {/* <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {getMonthName(item?.createdAt || "-")}
                    </td> */}
                    <td className="px-6 py-4 text-center text-gray-500 whitespace-nowrap cursor-pointer hover:text-blue-600">
                      {Math.round(item?.saving) || "-"} &euro;
                    </td>
                    <td
                      className="px-6 py-4 text-center text-gray-500 whitespace-nowrap cursor-pointer hover:text-blue-600"
                      onClick={() => handleTotalSavings(item.id)}
                    >
                      <CardTravelIcon />
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap cursor-pointer text-center hover:text-blue-600"
                      onClick={() =>
                        handleInvoiceDetails(item.id, item.extension)
                      }
                    >
                      <VisibilityIcon />
                    </td>
                    {(currentUser.user.user_type === "Leader" ||
                      currentUser.user.user_type === "Admin") && (
                      <td className="text-center">
                        <button
                          className="text-blue-600 dark:text-blue-500 hover:underline "
                          onClick={() => handleRevenueDetails(item.id)}
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
      <div className="mt-4 flex justify-between items-center gap-8 w-full">
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          Showing {currentPage * itemsPerPage + 1} -{" "}
          {Math.min((currentPage + 1) * itemsPerPage, data.length)} of{" "}
          {data.length} Items
        </div>
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
      {isInvoiceDetailsOpen && (
        <RevenueInvoiceDetails
          revenueId={revenueId}
          isOpen={isInvoiceDetailsOpen}
          onClose={handleInvoiceClose}
          extension={extension}
        />
      )}
      {/* Edit modal */}
      {isEditModalOpen && (
        <RevenueUpdate
          revenueId={revenueId}
          isOpen={isEditModalOpen}
          onClose={handleRevenueClose}
        />
      )}
      {isTotalSavingsOpen && (
        <TotalSavings
          isOpen={isTotalSavingsOpen}
          onClose={() => setIsTotalSavingsOpen(false)}
          revenueId={revenueId}
        />
      )}
    </div>
  );
};

export default RevenueTable;
