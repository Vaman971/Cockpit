import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MissionModal from "../../../components/Modal/MissionModal";
import EditNoteIcon from "@mui/icons-material/EditNote";
import MissUpdate from "../../../components/Modal/Update/MissionUpdateModal";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import axios from "axios";
import Select from "react-select";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MissionTeam from "../MissionTeam";
import { FaSortDown } from 'react-icons/fa';
import { FaSortUp } from 'react-icons/fa'

const Table = () => {
  const tableRef = useRef(null);
  const location = useLocation();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [data, setData] = useState([]);
  const [missionModal, setMissionModal] = useState(false);
  const [missionId, setMissionId] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedMissionType, setSelectedMissionType] = useState([]);
  const [isNewMission, setIsNewMission] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [currentItems, setCurrentItem] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState([]);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setpageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 20;
  const apiUrl = process.env.REACT_APP_API_URL;
  const statusOptions = ["Yet to Start", "In Progress", "Closed"];
  const Clusters = ["MEBM", "MNT", "SNPS", "RDI", "JSO", "Other"];
  const missionType = ["External", "Internal"];

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

  const handleProjectClick = () => {
    window.open(`/project/`); // Redirect to mission details page with mission id
  };

  // Export data as CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(data, {
      header: true,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "missions.csv");
  };
  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };
  const formatProjectId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `PRJ-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };


  useEffect(() => {
    axios
      .get(`${apiUrl}/users/getusers`, { withCredentials: true })
      .then((response) => {
        const data = response.data;
        const filteredUsers = data.filter(
          (user) => user.user_type === "Admin" || user.user_type === "Leader"
        );
        setUser(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [apiUrl]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/mission/getAll`, {
        withCredentials: true,
      });
      const responseData = res.data;

      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        let filteredData = responseData.filter(
          (item) => item.missionCards.active === true
        );
        if (query) {
          filteredData = filteredData.filter((item) => {
            const airbusIdExists = item.airbusId !== null && item.airbusId !== undefined;
            const projectTitleExists = item.missionCards && item.missionCards.project_title;
            const missionDescriptionExists = item.missionDescription;

            return (
              (airbusIdExists && item.airbusId.toString().includes(query.toString())) ||
              (projectTitleExists && item.missionCards.project_title.toLowerCase().includes(query.toLowerCase())) ||
              (missionDescriptionExists && item.missionDescription.toLowerCase().includes(query.toLowerCase()))
            );
          });
        }
        if (selectedLeads.length > 0) {
          const selectedLeadIds = selectedLeads.map((lead) =>
            parseInt(lead.value)
          );
          filteredData = filteredData.filter((item) =>
            selectedLeadIds.includes(item.missionCardLeader)
          );
        }
        if (selectedStatuses.length > 0) {
          const selectedStatusValues = selectedStatuses.map(
            (status) => status.value
          );
          filteredData = filteredData.filter((item) =>
            selectedStatusValues.includes(item.status)
          );
        }
        if (selectedClusters.length > 0) {
          filteredData = filteredData.filter((item) =>
            selectedClusters.includes(item.cluster)
          );
        }
        if (selectedRegion.length > 0) {
          filteredData = filteredData.filter((item) =>
            selectedRegion.map(region => region.value).includes(item.region)
          );
        }
        if (selectedMissionType.length > 0) {                                        // added this for the filter types only this if statement
          filteredData = filteredData.filter((item) =>
            selectedMissionType.map(mType => mType.value).includes(item.missionType)
          );
        }

        filteredData = filteredData.map(item => {
          const duration = calculateMissionDuration(item.missionStartDate, item.missionEndDate);
          return {
            ...item,
            duration: duration === "Not Specified" ? -1 : duration
          };
        });
        if (sortConfig.key) {
          filteredData.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (typeof aVal === 'string' && typeof bVal === 'string') {
              return sortConfig.direction === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }

            return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
          });
        }

        setData(filteredData);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const calculateMissionDuration = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "Not Specified";
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return diffMonths;
  };

  useEffect(() => {
    fetchData(); // Call fetchData() only once when the component mounts
  }, [
    isActionModalOpen,
    currentPage,
    query,
    selectedLeads,
    selectedStatuses,
    selectedClusters,
    selectedRegion,
    selectedMissionType,
    sortConfig
  ]); // Empty dependency array means it runs only on mount

  const goToLastPageAndRow = (mid) => {
    const num = data.length + 1;
    const lastPage = Math.floor(num / itemsPerPage) + (num % itemsPerPage > 0 ? 1 : 0);
    console.log(lastPage);


    const newOffset = (lastPage - 1) * itemsPerPage;
    setItemOffset(newOffset);
    setCurrentPage(lastPage - 1);

    setTimeout(() => {
      if (tableRef.current) {
        const lastRow = tableRef.current.lastElementChild;
        //console.log(lastRow);

        if (lastRow) {
          lastRow.scrollIntoView({ behavior: "smooth" });
          lastRow.style.backgroundColor = "#BAE6FD";
          lastRow.style.transition = "background-color 3s ease";


          setTimeout(() => {
            lastRow.style.backgroundColor = "";
            console.log(mid);
            setIsNewMission(true);
            toggleActionModal(mid);
          }, 1000);
        }
      }
    }, 300);
  }

  useEffect(() => {

    if (location.state && location.state.missionId) {
      const missionState = location.state;
      const idFromPo = missionState.missionId;
      console.log(idFromPo);
      toggleTeamModal(idFromPo);
    }
  }, [location.state]);

  const toggleActionModal = (id) => {
    setMissionId(id);
    setIsActionModalOpen(!isActionModalOpen);
  };

  const toggleTeamModal = (id) => {
    setMissionId(id);
    setIsTeamModalOpen(!isTeamModalOpen);
  }

  const handleMissionModal = () => {
    fetchData();
    setMissionModal(false);
  };

  const handleRegionChange = (selectedOptions) => {
    setSelectedRegion(selectedOptions);
  };

  const handleMissionClick = (id) => {
    const url = `/mission-details/${id}`;
    window.open(url, '_blank'); // Redirect to mission details page with mission id
  };

  const handleViewDoc = () => {
    window.open(`/sharePoint/`);
  }

  const leadOptions = user
    ? user.map((lead) => ({
      value: lead.user_id,
      label: lead.username,
    }))
    : [];

  const statusOptionsSelect = statusOptions.map((status) => ({
    value: status,
    label: status,
  }));

  const missionTypeOptions = missionType.map((type) => ({
    value: type,
    label: type,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center w-full">
        <p className="text-3xl font-bold text-blue-800 mb-4 ">Missions</p>
        {(currentUser.user.user_type === "Leader" ||
          currentUser.user.user_type === "Admin") && (
            <div>
              <button
                id="actionButton"
                className="inline-flex items-center text-white bg-blue-800 border border-gray-300 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-blue-700 dark:focus:ring-blue-700 ml-8"
                type="button"
                onClick={() => handleViewDoc()}
              >
                View Documents
              </button>
              <button
                id="actionButton"
                className="inline-flex items-center text-white bg-blue-800 border border-gray-300 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-blue-700 dark:focus:ring-blue-700 ml-8"
                type="button"
                onClick={() => setMissionModal(true)}
              >
                Add Mission
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
              placeholder="Search for Mission Desc..."
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              id="selectedLead"
              isMulti
              options={leadOptions}
              value={selectedLeads}
              onChange={(selected) => setSelectedLeads(selected)}
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Mission Lead..."
            />
          </div>

          <div className="flex items-center gap-4">
            <Select
              id="selectedStatus"
              isMulti
              options={statusOptionsSelect}
              value={selectedStatuses}
              onChange={(selected) => setSelectedStatuses(selected)}
              className="w-full text-md focus:outline-none focus:border-blue-800 text-blue-800 font-bold"
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Status..."
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

          <div className="flex items-center gap-4">
            <Select
              id="selectedType"
              value={selectedMissionType}
              onChange={(selected) => setSelectedMissionType(selected)}
              options={missionTypeOptions}
              isMulti
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Type..."
            />
          </div>
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white max-h-[60vh]">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-[2]">
              <tr>
                <th scope="col" className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Project Id</span>
                    <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                      <span
                        className={sortConfig.key === 'id' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('id', 'asc')}
                        style={{ cursor: 'pointer', marginBottom: '-4px' }}
                      >
                        <FaSortUp fontSize="medium" />
                      </span>

                      <span
                        className={sortConfig.key === 'id' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('id', 'desc')}
                        style={{ cursor: 'pointer', marginTop: '-4px' }}
                      >
                        <FaSortDown fontSize="medium" />
                      </span>
                    </div>
                  </div>
                </th>


                <th scope="col" className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Airbus Mission Id</span>
                    <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                      <span
                        className={sortConfig.key === 'airbusId' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('airbusId', 'asc')}
                        style={{ cursor: 'pointer', marginBottom: '-4px' }}
                      >
                        <FaSortUp fontSize="medium" />
                      </span>


                      <span
                        className={sortConfig.key === 'airbusId' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('airbusId', 'desc')}
                        style={{ cursor: 'pointer', marginTop: '-4px' }}
                      >
                        <FaSortDown fontSize="medium" />
                      </span>
                    </div>
                  </div>
                </th>


                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <span>Mission Description</span>
                    <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                      <span
                        className={sortConfig.key === 'missionDescription' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('missionDescription', 'asc')}
                        style={{ cursor: 'pointer', marginBottom: '-4px' }}
                      >
                        <FaSortUp fontSize="medium" />
                      </span>


                      <span
                        className={sortConfig.key === 'missionDescription' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('missionDescription', 'desc')}
                        style={{ cursor: 'pointer', marginTop: '-4px' }}
                      >
                        <FaSortDown fontSize="medium" />
                      </span>
                    </div>
                  </div>
                </th>


                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <span>Mission Leader</span>
                    <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                      <span
                        className={sortConfig.key === 'missionCardLeader' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('missionCardLeader', 'asc')}
                        style={{ cursor: 'pointer', marginBottom: '-4px' }}
                      >
                        <FaSortUp fontSize="medium" />
                      </span>


                      <span
                        className={sortConfig.key === 'missionCardLeader' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('missionCardLeader', 'desc')}
                        style={{ cursor: 'pointer', marginTop: '-4px' }}
                      >
                        <FaSortDown fontSize="medium" />
                      </span>
                    </div>
                  </div>
                </th>


                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <span>Start Date</span>
                    <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                      <span
                        className={sortConfig.key === 'missionStartDate' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('missionStartDate', 'asc')}
                        style={{ cursor: 'pointer', marginBottom: '-4px' }}
                      >
                        <FaSortUp fontSize="medium" />
                      </span>


                      <span
                        className={sortConfig.key === 'missionStartDate' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('missionStartDate', 'desc')}
                        style={{ cursor: 'pointer', marginTop: '-4px' }}
                      >
                        <FaSortDown fontSize="medium" />
                      </span>
                    </div>
                  </div>
                </th>


                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <span>End Date</span>
                    <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                      <span
                        className={sortConfig.key === 'missionEndDate' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('missionEndDate', 'asc')}
                        style={{ cursor: 'pointer', marginBottom: '-4px' }}
                      >
                        <FaSortUp fontSize="medium" />
                      </span>


                      <span
                        className={sortConfig.key === 'missionEndDate' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('missionEndDate', 'desc')}
                        style={{ cursor: 'pointer', marginTop: '-4px' }}
                      >
                        <FaSortDown fontSize="medium" />
                      </span>
                    </div>
                  </div>
                </th>


                <th scope="col" className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Duration</span>
                    <div className="flex flex-col items-center text-xs" style={{ lineHeight: '1' }}>
                      <span
                        className={sortConfig.key === 'duration' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('duration', 'asc')}
                        style={{ cursor: 'pointer', marginBottom: '-4px' }}
                      >
                        <FaSortUp fontSize="medium" />
                      </span>


                      <span
                        className={sortConfig.key === 'duration' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                        onClick={() => handleSort('duration', 'desc')}
                        style={{ cursor: 'pointer', marginTop: '-4px' }}
                      >
                        <FaSortDown fontSize="medium" />
                      </span>
                    </div>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-center">
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

                <th scope="col" className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Siglum</span>
                    <div className="flex flex-col items-center text-xs invisible" style={{ lineHeight: '1' }}>
                      <FaSortUp fontSize="medium" style={{ marginBottom: '-4px' }} />
                      <FaSortDown fontSize="medium" style={{ marginTop: '-4px' }} />
                    </div>
                  </div>
                </th>

                {(currentUser.user.user_type === "Leader" || currentUser.user.user_type === "Admin") && (
                  <th scope="col" className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span>Team</span>
                      <div className="flex flex-col items-center text-xs invisible" style={{ lineHeight: '1' }}>
                        <FaSortUp fontSize="medium" style={{ marginBottom: '-4px' }} />
                        <FaSortDown fontSize="medium" style={{ marginTop: '-4px' }} />
                      </div>
                    </div>
                  </th>
                )}

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
              </tr>
            </thead>
            <tbody ref={tableRef}>
              {currentItems &&
                currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-center"
                  >
                    <td className=" px-6 py-4 text-gray-900  dark:text-white text-center cursor-pointer"
                      onClick={() => handleMissionClick(item.id)}>
                      <div className="ps-3 ">
                        <div className="text-base text-nowrap font-semibold flex justify-center align-center">
                          <span className="badge badge-outline-info text-center">
                            {item.airbusId || "-"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className=" px-6 py-4 text-gray-900  dark:text-white text-center cursor-pointer"
                      onClick={() => handleProjectClick(item.id)}>
                      <div className="ps-3 ">
                        <div className="text-base text-nowrap font-semibold flex justify-center align-center">
                          <span className="badge badge-outline-info text-center">
                            {formatProjectId(item.projMissionId || "-")}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {item.missionCards
                        ? item.missionDescription ||
                        item.missionCards.project_title
                        : "NA"}
                    </td>
                    <td className="px-6 py-4">
                      {item.missionCardLeader
                        ? item.assignedMissionCards.username
                        : "NA"}
                    </td>
                    <td className="px-6 py-4">{item.missionStartDate}</td>
                    <td className="px-6 py-4">
                      {item.missionEndDate || "Not specified"}
                    </td>
                    {/* <td className="px-6 py-4">
                      {calculateMissionDuration(
                        item.missionStartDate,
                        item.missionEndDate
                      ) + " Months" || "Not specified"}
                    </td> */}
                    <td className="px-6 py-4">
                      {item.duration !== -1 ? `${item.duration} Months` : "Not Specified"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`badge border ${item.status === "Yet to Start" ? "badge bg-info/20 text-info rounded-full hover:top-0" :
                          item.status === "In Progress" ? "badge bg-success/20 text-success rounded-full hover:top-0" :
                            item.status === "Closed" ? "badge bg-black/40 text-white rounded-full hover:top-0" :
                              ""
                          }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.cluster || "Not specified"}
                    </td>
                    <td className="px-6 py-4">{item.siglum || "-"}</td>
                    {(currentUser.user.user_type === "Leader" ||
                      currentUser.user.user_type === "Admin") && (
                        <td>
                          <button
                            className="text-blue-600 dark:text-blue-500 hover:underline"
                            onClick={() => toggleTeamModal(item.id)}
                          >
                            <VisibilityIcon />
                          </button>
                        </td>
                      )}
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
        <MissUpdate
          isOpen={isActionModalOpen}
          //onClose={() => setIsActionModalOpen(false)}

          onClose={() => {
            setIsActionModalOpen(false);
            setIsNewMission(false); //  Reset after closing
          }}

          missionId={missionId}
          //toggleTeamModal={toggleTeamModal}
          toggleTeamModal={isNewMission ? toggleTeamModal : null} //  Only pass if new
          isNewMission={isNewMission} //for skip button      
        />
      )}

      {
        isTeamModalOpen && (
          <MissionTeam
            isOpen={isTeamModalOpen}
            onClose={() => setIsTeamModalOpen(false)}
            missionId={missionId}
            toggleActionModal={toggleActionModal}
          />
        )
      }

      {missionModal && (
        <MissionModal isOpen={missionModal} onClose={handleMissionModal} goToLastPageAndRow={goToLastPageAndRow} />
      )}
    </div>
  );
};

export default Table;
