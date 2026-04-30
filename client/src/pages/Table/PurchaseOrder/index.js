import React, { useCallback, useState, useEffect, useRef } from "react"; 
import { useParams , useNavigate, useLocation } from "react-router-dom";      
import axios from "axios";
import ReactPaginate from "react-paginate";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useSelector } from "react-redux";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InvoiceDetails from "../../../components/Modal/InvoiceDetails";
import PoUpdate from "../../../components/Modal/Update/PurchaseUpdateModal";
import Select from "react-select";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import PoCreateModal from "../../../components/Modal/CreatePoModal";
import { toast } from "react-toastify";

const PurchaseTable = () => {
  const { id, mId } = useParams();
  const [targetRowIndex, setTargetRowIndex] = useState(null); 
  const [missionId, setMissionId] = useState('');
  const rowRefs = useRef([]); 
  const navigate = useNavigate();
  const location = useLocation();  
  const [data, setData] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [poId, setPoId] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);
  const [selectedLeaders, setSelectedLeaders] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [poModal, setPoModal] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const itemsPerPage = 20;

  const regionOptions = [
    { value: "FR", label: "France" },
    { value: "DE", label: "Germany" },
    { value: "UK", label: "United Kingdom" },
    { value: "IN", label: "India" },
    { value: "ES", label: "Spain" },
    { value: "NA", label: "Other" },
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

  const fetchLeaders = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/users/getusers`, {
        withCredentials: true,
      });
      const responseData = res.data;
      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        setLeaders(
          responseData.filter(
            (user) => user.user_type === 'Leader' || user.user_type === 'Admin'
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  }, [apiUrl]);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/po/getAll`, {
        withCredentials: true,
      });
      const responseData = res.data;

      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        let filteredData = responseData.filter((item) => item.active === true);

        if (query) {
          filteredData = filteredData.filter((item) =>
            (item.projectPo.airbusId &&
              item.projectPo.airbusId
                .toLowerCase()
                .includes(query.toLowerCase())) ||
            (item.poNumber !== null &&
              item.poNumber.toLowerCase().includes(query.toLowerCase())) || (
              item.poDescription !== null &&
              item.poDescription.toLowerCase().includes(query.toLowerCase())
            )
          );
        }

        if (selectedStatuses.length > 0) {
          const selectedStatusValues = selectedStatuses.map((status) => status.value);
          filteredData = filteredData.filter((item) =>
            selectedStatusValues.includes(item.poStatus)
          );
        }

        if (selectedClusters.length > 0) {
          const selectedClusterValues = selectedClusters.map((cluster) => cluster.value);
          filteredData = filteredData.filter((item) =>
            selectedClusterValues.includes(item.cluster)
          );
        }

        if (selectedLeaders.length > 0) {
          const selectedLeaderValues = selectedLeaders.map((leader) => leader.value);
          filteredData = filteredData.filter((item) =>
            selectedLeaderValues.includes(item.projectPo.missionCardLeader)
          );
        }

        if (selectedRegion.length > 0) {
          filteredData = filteredData.filter((item) =>
            selectedRegion.map((region) => region.value).includes(item.region)
          );
        }

        setData(filteredData);
        setPageCount(Math.ceil(filteredData.length / itemsPerPage));
      }
    } catch (error) {
      console.log(error.message);
    }
  }, [apiUrl, query, selectedStatuses, selectedClusters, selectedLeaders, selectedRegion, itemsPerPage]);

  useEffect(() => {
    fetchData();
    fetchLeaders();
  }, [
    currentPage,
    isEditModalOpen,
    isInvoiceDetailsOpen,
    selectedStatuses,
    query,
    selectedClusters,
    selectedRegion,
    selectedLeaders,
    fetchData,
    fetchLeaders
  ]);

  const handleLeaderChange = (selectedOptions) => {
    setSelectedLeaders(selectedOptions);
  };

  const handlePageClick = (e) => {
    setCurrentPage(e.selected);
  };

  const handleInvoiceDetails = (id) => {
    setPoId(id);
    setIsInvoiceDetailsOpen(true);
  };

  const handleInvoiceClose = () => {
    setIsInvoiceDetailsOpen(false);
    setMissionId('');   
  };

  const handlePurchaseClose = () => {
    setIsEditModalOpen(false);
    setMissionId('');   
  };

  const handlePurchaseDetails = (id) => {
    setPoId(id);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = (selectedOptions) => {
    setSelectedStatuses(selectedOptions);
  };

  const handleClusterChange = (selectedOptions) => {
    setSelectedClusters(selectedOptions);
  };

  const handleRegionChange = (selectedOptions) => {
    setSelectedRegion(selectedOptions);
  };

  const handlePoModal = () => {
    setPoModal(false)
  }

  // Export data as CSV
  const handleExportCSV = async () => {

    const res = await axios.get(`${apiUrl}/analytics/getPoExcelData`, {
      withCredentials: true,
    });
    const responseData = res.data;

    const csv = Papa.unparse(responseData, {
      header: true,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "purchase_order.csv");
  };

  const formatPoId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `PO-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  const getMonthName = (exp) => {
    if (exp === "-") {
      return "-";
    }

    let newExp = exp.split("-");
    let year = newExp[0];
    let monthNumber = newExp[1];
    let day = newExp[2];

    const date = new Date(year, monthNumber - 1, day);

    // Format the date to "day-month-year"
    const formattedDate = date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return formattedDate.replace(",", ""); // Remove the comma for desired format
  };

  useEffect(()=>{                                                                      
    if (location?.state?.missionId) {
      setMissionId(location.state.missionId);
    }
  },[location]);
 
  useEffect(() => {
    if (id && data.length > 0) {      
      console.log(data.length);
 
      const index = data.findIndex(row => row.id === Number(id));
      console.log(index);
      setTargetRowIndex(index % 20);
 
      if(index === 0){
        setCurrentPage(0);
      }else{
        const pageNo = Math.ceil(index / 20);
        setCurrentPage(pageNo - 1);
      }
    }
  }, [id, data.length]);

  useEffect(() => {
    if (targetRowIndex !== null) {
      const rowOnPageIndex = targetRowIndex % 20;
 
      console.log(`${rowOnPageIndex} ro`);

      const targetRow = rowRefs.current[rowOnPageIndex];
      console.log(targetRow);

 
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
        console.log(targetRow);
        targetRow.style.backgroundColor = "#BAE6FD";
        targetRow.style.transition = "background-color 3s ease";
        if(missionId){  
        setTimeout(() => {
          targetRow.style.backgroundColor = "";
          handlePurchaseDetails(id);
 
        }, 1000);

      }
 
      }
    }
  }, [targetRowIndex]);

  const handleBack = ()=>{                                                     
    if(missionId){
    console.log(missionId);
    navigate(`/missionPage/teamModal/${missionId}`, { state: { missionId } });
    }else{
      toast.error("cannot go back")
    }
  };

  const handelMissionIdClick = (id) => {               
    if (id != null) {
      window.open(`/mission-details/${id}`, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center w-full">
        <p className="text-3xl font-bold text-blue-800 mb-4">Purchase Order</p>
        {(currentUser.user.user_type === "Leader" ||
          currentUser.user.user_type === "Admin") && (
            <div>
              <button
                id="actionButton"
                className="inline-flex items-center text-white bg-blue-800 border border-gray-300 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-blue-700 dark:focus:ring-blue-700 ml-8"
                type="button"
                onClick={() => setPoModal(true)}
              >
                Add PO
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
              className="block pt-2 ps-10 text-sm w- text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
              id="selectedStatuses"
              value={selectedStatuses}
              onChange={handleStatusChange}
              options={[
                { value: "pending", label: "Pending" },
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
                { value: "canceled", label: "Canceled" },
              ]}
              isMulti
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Status..."
            />
          </div>

          <div className="flex items-center gap-4">
            <Select
              id="selectedClusters"
              value={selectedClusters}
              onChange={handleClusterChange}
              options={[
                { value: "SNPS", label: "S&PS" },
                { value: "MEBM", label: "MEBM" },
                { value: "MNT", label: "MNT" },
                { value: "RDI", label: "RDI"},
                { value: "JSO", label: "JSO"},
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
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-[2]">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                PO Id
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Airbus Mission ID
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                PO Number
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                PO Amount
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Forecasted Invoice
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Amount Delivered
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                PO Start Date
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                PO End Date
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Cluster
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Siglum
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                View Delivery Note
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
              .map((item, index) => (
                <tr key={item.id}
                  data-id={item.id}
                  ref={(el) => (rowRefs.current[index] = el)}
                > 
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="badge badge-outline-info">
                        {formatPoId(item.id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item?.poDescription || "-"}
                    </td>
                    <td className="text-sm font-medium text-gray-400 flex justify-center items-center whitespace-nowrap ">
                    <button                                                          
                      onClick={() => handelMissionIdClick(item.projectPo.id)}>       
                      <span className="badge badge-outline-info">                    
                        {item.projectPo.airbusId || "-"}                            
                      </span>                                                      
                    </button> 
                    </td>
                    <td className="px-6 py-4">{item?.poNumber || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {Math.round(item?.poAmount) || "-"} {getCurrencySymbol(item?.currencyCode)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {Math.round(item?.poForecast) || "-"} {getCurrencySymbol(item?.currencyCode)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {Math.round(item?.poPrice) || "-"} {getCurrencySymbol(item?.currencyCode)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {getMonthName(item?.poDate || "-")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {getMonthName(item?.projectPo.missionEndDate  || "-")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      <span
                        className={`badge border ${item.poStatus === "pending"
                            ? "badge bg-primary/20 text-primary rounded-full hover:top-0"
                            : item.poStatus === "closed"
                              ? "badge bg-success/20 text-success rounded-full hover:top-0"
                              : item.poStatus === "open"
                                ? "badge bg-secondary/20 text-secondary rounded-full hover:top-0"
                                : "badge-outline-danger"
                          }`}
                      >
                        {item.poStatus || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {item?.cluster || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                      {item?.projectPo.siglum || "-"}
                    </td>

                    <td
                      className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap cursor-pointer text-center"
                      onClick={() => handleInvoiceDetails(item.id)}
                    >
                      <VisibilityIcon />
                    </td>
                    {(currentUser.user.user_type === "Leader" ||
                      currentUser.user.user_type === "Admin") && (
                        <td className="text-center">
                          <button
                            className="text-blue-600 dark:text-blue-500 hover:underline "
                            onClick={() => handlePurchaseDetails(item.id)}
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
          forcePage={currentPage}  
        />
      </div>
      {isInvoiceDetailsOpen && (
        <InvoiceDetails
          poId={poId}
          isOpen={isInvoiceDetailsOpen}
          onClose={handleInvoiceClose}
          handlePurchaseDetails={handlePurchaseDetails} 
        />
      )}
      {isEditModalOpen && (
        <PoUpdate
          poId={poId}
          isOpen={isEditModalOpen}
          onClose={handlePurchaseClose}
          handleInvoiceDetails={handleInvoiceDetails}
          handleBack={handleBack}                                   
          missionId={missionId}
          showSkipButton={missionId}
        />
      )}
      {poModal && (
        <PoCreateModal isOpen={poModal} onClose={handlePoModal} />
      )}
    </div>
  );
};

export default PurchaseTable;