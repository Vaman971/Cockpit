import React, { useCallback, useState, useEffect } from "react";
import ActionModal from "../../../components/Modal/OppActionModal";
import ReactPaginate from "react-paginate";
import AddModal from "../../../components/Modal/AddModal";
import "react-toastify/dist/ReactToastify.css";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useDispatch, useSelector } from "react-redux";
import { fetchOpportunities, selectAllOpportunities, selectOpportunityStatus } from "../../../redux/opportunity/opportunitySlice";
import api from "../../../axios";
import { opportunityService } from "../../../services/opportunityService";
import DataModal from "../../../components/Modal/DateModal";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";
import Select from "react-select";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import IconPaperclip from "../../../components/Icon/IconPaperClip";
import CheckedOpp from "../../../components/Modal/CheckedOpp";
import { FaSortDown } from 'react-icons/fa';
import { FaSortUp } from 'react-icons/fa';
// import api from "../../../axios";

const Table = () => {
  const dispatch = useDispatch();
  const allOpportunities = useSelector(selectAllOpportunities);
  const opportunityStatus = useSelector(selectOpportunityStatus);
  const { currentUser } = useSelector((state) => state.user);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isCheckedOpp, setIsCheckedOpp] = useState(false);
  const [opportunityId, setOpportunityId] = useState(null);
  const [data, setData] = useState([]);
  const [addModal, setAddModal] = useState(null);
  const [user, setUser] = useState([]);
  const [leadUser, setLeadUser] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState([]);
  const [formData, setFormData] = useState({});
  const [query, setQuery] = useState("");
  const Status = ["Prospection", "Advanced", "Proposal", "Won", "Lost", "Hold"];
  const Clusters = ["MEBM", "MNT", "SNPS", "RDI", "JSO", "Other"];
  const priorities = ["High", "Medium", "Low"];
  const navigate = useNavigate();
  const [currentItems, setCurrentItem] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setpageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [editingComments, setEditingComments] = useState({});
  const itemsPerPage = 20;

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

  // sort
  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (opportunityStatus === 'idle' || !isActionModalOpen || !addModal || !isCheckedOpp || !isDataModalOpen) {
      dispatch(fetchOpportunities());
    }
  }, [dispatch, opportunityStatus, isActionModalOpen, addModal, isCheckedOpp, isDataModalOpen]);

  useEffect(() => {
    const Keys = [
      "Siglum", // Prioritize Siglum
      "CustomerContactPoint",
      "OpDescription",
      "OpRegion",
      "OpUnit",
      "source",
      "AssociatedWP",
    ];

    let filteredData = allOpportunities.filter((item) => {
      const isLeadUserMatch = leadUser.length === 0 || leadUser.includes(item.ledByUser?.user_id);
      const isStatusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
      const isClusterMatch = selectedClusters.length === 0 || selectedClusters.includes(item.cluster);
      const isPriortiesMatch = selectedPriorities.length === 0 || selectedPriorities.includes(item.Priority);

      const isQueryMatch = !query || query === "" ||
        ["Siglum", "CustomerContactPoint"].some((key) => item[key]?.toLowerCase().includes(query.toLowerCase())) ||
        Keys.some((key) => item[key]?.toLowerCase().includes(query.toLowerCase()));

      return isLeadUserMatch && isStatusMatch && isClusterMatch && isQueryMatch && isPriortiesMatch;
    });

    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    setData(filteredData);
  }, [allOpportunities, leadUser, selectedStatuses, selectedClusters, query, selectedPriorities, sortConfig]);

  const fetchUserOptions = useCallback(async () => {
    try {
      const res = await api.get("/users/getusers");
      const data = res.data;
      const filteredUsers = data.filter(
        (user) => user.user_type === "Admin" || user.user_type === "Leader"
      );
      setUser(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserOptions();
  }, [fetchUserOptions]);

  const toggleActionModal = (id) => {
    setOpportunityId(id); // Set the ID here
    setIsActionModalOpen(!isActionModalOpen);
  };

  const toggleCheckOppModal = (id) => {
    setOpportunityId(id); // Set the ID here
    setIsCheckedOpp(!isCheckedOpp);
  };

  const toggleDataModal = (id) => {
    setOpportunityId(id); // Set the ID here
    setIsDataModalOpen(!isDataModalOpen);
  };

  const handleCloseModal = () => {
    setIsActionModalOpen(false);
    setIsDataModalOpen(false);
    setIsCheckedOpp(false);
  };

  const handleAddModal = () => {
    dispatch(fetchOpportunities());
    setAddModal(false);
  };

  const handleLeadUserChange = (selectedOptions) => {
    setLeadUser(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    );
    console.log(leadUser);
  };

  const handleCheckboxChange = async (e, id) => {
    // Toggle selection state
    const isSelected = selectedOpp.includes(id);
    const newSelectedOpp = isSelected ?
      selectedOpp.filter(item => item !== id) :
      [...selectedOpp, id];

    setSelectedOpp(newSelectedOpp);

    // Store in localStorage to persist across page changes
    localStorage.setItem('selectedOpp', JSON.stringify(newSelectedOpp));

    // Update UI state
    setIsCheckedOpp(!isSelected);
    setOpportunityId(id);

    try {
      // Update opportunity in database
      await opportunityService.update(id, { MarkedOpp: !isSelected });
      toast.success("Opportunity marked successfully");
    } catch (error) {
      toast.error("Failed to mark opportunity");
      console.error("Error:", error);
    }
  };

  const handleCommentChange = (e, id) => {
    const { value } = e.target;
    setEditingComments((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCommentSubmit = async (id) => {
    const newComment = editingComments[id];
    if (newComment === undefined) return;

    // Update local state
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, comments: newComment } : item
      )
    );

    // Prepare the updated item for backend
    const item = data.find((item) => item.id === id);
    if (!item) return;

    const updatedItem = { ...item, comments: newComment };

    // Save to backend
    try {
      const res = await opportunityService.update(id, updatedItem);

      const responseData = res.data;

      if (responseData.success === false) {
        console.log("Backend update failed:", responseData.message);
      } else {
        console.log("Comment successfully saved to backend.");
      }
    } catch (error) {
      console.log("Error saving comment to backend:", error.message);
    }
  };


  useEffect(() => {
    const savedSelectedOpp = localStorage.getItem('selectedOpp');
    if (savedSelectedOpp) {
      setSelectedOpp(JSON.parse(savedSelectedOpp));
    }
  }, []);

  // Export data as CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(data, {
      header: true,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "opportunities_data.csv");
  };

  const handleOpportunityClick = (id) => {
    window.open(`/opportunity-details/${id}`);
  };


  const formatDate = (dateString) => {
    if (dateString === "-") {
      return "-";
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 ">
      <div className="flex justify-between items-center w-full">
        <p className="text-3xl font-bold text-blue-800 mb-4 "> Opportunities</p>
        {(currentUser.user.user_type === "Leader" ||
          currentUser.user.user_type === "Admin") && (
            <div>
              <button
                id="actionButton"
                className="inline-flex items-center text-white bg-blue-800 border border-gray-300 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-blue-700 dark:focus:ring-blue-700"
                type="button"
                onClick={() => setAddModal(true)}
              >
                Add Opportunity
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
      <div className="relative overflow-x-auto shadow-md sm:rounded-t-lg ">
        <div className="flex items-center justify-between flex-column md:flex-row pl-[20px] pr-[20px] flex-wrap space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900 gap-8">
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="relative">
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
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search for Opportunities"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              id="ledBy"
              name="ledBy"
              value={user
                .filter((u) => leadUser.includes(u.user_id))
                .map((u) => ({ value: u.user_id, label: u.username }))}
              onChange={handleLeadUserChange}
              options={
                user &&
                user.map((u) => ({ value: u.user_id, label: u.username }))
              }
              isMulti
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="led By..."
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              id="cluster"
              name="cluster"
              isMulti
              value={selectedClusters.map((cluster) => ({
                value: cluster,
                label: cluster,
              }))}
              onChange={(selected) =>
                setSelectedClusters(
                  selected ? selected.map((option) => option.value) : []
                )
              }
              options={Clusters.map((cluster) => ({
                value: cluster,
                label: cluster,
              }))}
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Cluster..."
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              id="priority"
              name="priority"
              isMulti
              value={selectedPriorities.map((priority) => ({
                value: priority,
                label: priority,
              }))}
              onChange={(selected) =>
                setSelectedPriorities(
                  selected ? selected.map((option) => option.value) : []
                )
              }
              options={priorities.map((priority) => ({
                value: priority,
                label: priority,
              }))}
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Priority..."
            />
          </div>

          <div className="flex items-center gap-4">
            <Select
              id="status"
              name="status"
              isMulti
              value={selectedStatuses.map((status) => ({
                value: status,
                label: status,
              }))}
              onChange={(selected) =>
                setSelectedStatuses(
                  selected ? selected.map((option) => option.value) : []
                )
              }
              options={Status.map((status) => ({
                value: status,
                label: status,
              }))}
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Status..."
            />
          </div>
        </div>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-b-lg max-h-[60vh]">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 ">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-[2]">
            <tr>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex flex-col items-center justify-center">
                  Included in <br /> financial projection
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center ">
                <div className="flex items-center justify-center gap-1">
                  <span>Opportunity Region</span>
                  <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                    <span
                      className={sortConfig.key === 'OpRegion' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('OpRegion', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'OpRegion' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('OpRegion', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center ">
                <div className="flex items-center justify-center gap-1">
                  <span>Customer Contact Point</span>
                  <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                    <span
                      className={sortConfig.key === 'CustomerContactPoint' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('CustomerContactPoint', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'CustomerContactPoint' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('CustomerContactPoint', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Siglum</span>
                  <div className="flex flex-col items-center text-xs invisible" style={{ lineHeight: '1' }}>
                    <FaSortUp fontSize="medium" style={{ marginBottom: '-4px' }} />
                    <FaSortDown fontSize="medium" style={{ marginTop: '-4px' }} />
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Cluster</span>
                  <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                    <span
                      className={sortConfig.key === 'cluster' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('cluster', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>


                    <span
                      className={sortConfig.key === 'cluster' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('cluster', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center ">
                <div className="flex items-center justify-center gap-1">
                  <span>Opportunity Description</span>
                  <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                    <span
                      className={sortConfig.key === 'OpDescription' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('OpDescription', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'OpDescription' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('OpDescription', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Comments</span>
                  <div className="flex flex-col items-center text-xs invisible" style={{ lineHeight: '1' }}>
                    <FaSortUp fontSize="medium" style={{ marginBottom: '-4px' }} />
                    <FaSortDown fontSize="medium" style={{ marginTop: '-4px' }} />
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 relative text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  <div className="flex flex-col items-center text-xs invisible" style={{ lineHeight: '1' }}>
                    <FaSortUp fontSize="medium" style={{ marginBottom: '-4px' }} />
                    <FaSortDown fontSize="medium" style={{ marginTop: '-4px' }} />
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Led By</span>
                  <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                    <span
                      className={sortConfig.key === 'ledBy' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('ledBy', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'ledBy' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('ledBy', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center ">
                <div className="flex items-center justify-center gap-1">
                  <span>Latest Contact Date</span>
                  <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                    <span
                      className={sortConfig.key === 'LatestContactDate' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('LatestContactDate', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'LatestContactDate' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('LatestContactDate', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Next Contact Date</span>
                  <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                    <span
                      className={sortConfig.key === 'NextContactDate' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('NextContactDate', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'NextContactDate' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('NextContactDate', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              {(currentUser.user.user_type === "Leader" || currentUser.user.user_type === "Admin") && (
                <th scope="col" className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Action</span>
                    <div className="flex flex-col items-center text-xs invisible" style={{ lineHeight: '1' }}>
                      <FaSortUp fontSize="medium" style={{ marginBottom: '-4px' }} />
                      <FaSortDown fontSize="medium" style={{ marginTop: '-4px' }} />
                    </div>
                  </div>
                </th>
              )}

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Details</span>
                  <div className="flex flex-col items-center text-xs invisible" style={{ lineHeight: '1' }}>
                    <FaSortUp fontSize="medium" style={{ marginBottom: '-4px' }} />
                    <FaSortDown fontSize="medium" style={{ marginTop: '-4px' }} />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems &&
              currentItems.map((item) => (
                <tr
                  key={item.id}
                  className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer`}
                  onClick={() => handleOpportunityClick(item.id)} // Added onClick event here
                >
                  <td>
                    <div className="ltr:mr-3 rtl:ml-3">
                      <input
                        type="checkbox"
                        id={`chk-${item.id}`}
                        value={item.id}
                        checked={selectedOpp.includes(item.id)}
                        onChange={(e) => handleCheckboxChange(e, item.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="form-checkbox"
                      />
                    </div>
                  </td>
                  <td className="text-center">{item.OpRegion}</td>
                  <td className="text-center">
                    {item.CustomerContactPoint || "-"}
                  </td>
                  <td className="text-center">
                    {item?.Siglum || "-"}
                  </td>
                  <td className="text-center">
                    {item?.cluster || "-"}
                  </td>
                  <td className="text-center">
                    {item.OpDescription}
                  </td>
                  <td className="text-center">
                    <textarea
                      className="badge badge-outline-primary py-0 text-xs align-top resize-none text-left text-black"
                      type="text"
                      // value={item.comments}
                      value={editingComments[item.id] ?? item.comments}
                      onChange={(e) => handleCommentChange(e, item.id)}
                      onBlur={() => handleCommentSubmit(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    >
                    </textarea>
                  </td>
                  <td className="text-sm text-gray-500 whitespace-nowrap text-center rounded-xl flex justify-center items-center">
                    <span
                      className={` badge  border ${item.status === "Won"
                        ? "badge bg-success/20 text-success rounded-full hover:top-0"
                        : item.status === "Lost"
                          ? "badge bg-danger/20 text-danger rounded-full hover:top-0"
                          : item.status === "Hold"
                            ? "badge bg-warning/20 text-warning rounded-full hover:top-0"
                            : item.status === "Prospection"
                              ? "badge bg-primary/20 text-primary rounded-full hover:top-0"
                              : item.status === "Advanced"
                                ? "badge bg-secondary/20 text-secondary rounded-full hover:top-0"
                                : item.status === "Proposal"
                                  ? "badge bg-dark/20 text-dark rounded-full hover:top-0"
                                  : ""
                        }`}
                    >
                      {" "}
                      {item.status}{" "}
                    </span>
                  </td>

                  <td className="text-sm text-gray-500 text-center">
                    {item?.ledByUser?.username}
                  </td>
                  <td className="text-sm text-gray-500 text-center">
                    {formatDate(item.LatestContactDate || "-")}
                  </td>
                  <td className="text-sm text-gray-500 text-center">
                    {formatDate(item.NextContactDate || "-")}
                  </td>
                  {(currentUser.user.user_type === "Leader" ||
                    currentUser.user.user_type === "Admin") && (
                      <td className="text-center">
                        <button
                          className="text-blue-600 dark:text-blue-500 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click from firing
                            toggleActionModal(item.id);
                          }}
                        >
                          <EditNoteIcon />
                        </button>
                      </td>
                    )}
                  <td className="text-center">
                    <button
                      className="text-blue-600 dark:text-blue-500 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click from firing
                        toggleDataModal(item.id);
                      }}
                    >
                      <VisibilityIcon />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
      {
        isCheckedOpp && (
          <CheckedOpp
            isOpen={isCheckedOpp}
            onClose={handleCloseModal}
            opportunityId={opportunityId}
          />
        )
      }
      {isActionModalOpen && (
        <ActionModal
          isOpen={isActionModalOpen}
          onClose={handleCloseModal}
          opportunityId={opportunityId}
        />
      )}
      {addModal && <AddModal isOpen={addModal} closeModal={handleAddModal} />}
      {isDataModalOpen && (
        <DataModal
          isOpen={isDataModalOpen}
          onClose={handleCloseModal}
          opportunityId={opportunityId}
        />
      )}
    </div>
  );
};

export default Table;