import React, { useCallback, useState, useEffect } from "react";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ProjectModal from "../../../components/Modal/Update/ProjectUpdateModal";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import axios from "axios";
import { Dropdown } from "flowbite-react";
import { useSelector } from "react-redux";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { FaSortDown } from 'react-icons/fa';
import { FaSortUp } from 'react-icons/fa';

const Table = () => {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [projectId, setProjectId] = useState(null);
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [query, setQuery] = useState("");
  const [user, setUser] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [missionData, setMissionData] = useState(null); // Add state for mission data
  const [currentItems, setCurrentItem] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setpageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const Clusters = ["MEBM", "MNT", "SNPS", "RDI", "JSO", "Other"];
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

  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "InActive" },
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



  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/project/getProj`, {
        withCredentials: true,
      });
      const responseData = res.data;

      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        let filteredData = responseData.filter(
          (item) => item.ProjOpp.status === "Won"
        );

        // Apply search filter if query exists
        if (query) {
          filteredData = filteredData.filter((item) =>
            item.project_title.toLowerCase().includes(query.toLowerCase())
          );
          setData(filteredData);
        }
        if (selectedClusters && selectedClusters.length > 0) {
          filteredData = filteredData.filter((item) =>
            selectedClusters.includes(item.cluster)
          );
        }
        if (selectedRegion && selectedRegion.length > 0) {
          filteredData = filteredData.filter((item) =>
            selectedRegion.some((region) => region.value === item.region)
          );
        }
        if (selectedStatus && selectedStatus.length > 0) {
          filteredData = filteredData.filter((item) =>
            selectedStatus.some((status) => status.value === item.status)
          );
        }

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
  }, [apiUrl, query, selectedClusters, selectedRegion, selectedStatus, sortConfig]);

  const fetchMissionData = useCallback(async () => {
    // Fetch mission data
    try {
      const res = await axios.get(`${apiUrl}/mission/getAll`, {
        withCredentials: true,
      });
      const data = res.data;

      if (data.success === false) {
        console.log(data.message);
      } else {
        setMissionData(data);
      }
    } catch (error) {
      console.log(error.message);
    }
  }, [apiUrl]);

  const fetchUserOptions = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/users/getusers`, {
        withCredentials: true,
      });
      const data = res.data;
      //console.log(data)
      setUser(data);

    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchData();
    fetchMissionData();
    fetchUserOptions();
  }, [isActionModalOpen, currentPage, query, selectedClusters, selectedRegion, selectedStatus, fetchData, fetchMissionData, fetchUserOptions]);

  // Export data as CSV
  const handleExportCSV = async () => {
    try {
      const res = await axios.get(`${apiUrl}/project/getProjectExcel`, {
        withCredentials: true,
      });

      const csv = Papa.unparse(res.data, { header: true });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "project_data.csv");
    } catch (error) {
      console.error("CSV export failed", error);
    }
  };

  const getLeadUsername = (leadUserId) => {
    // If the leadUserIds array is empty or undefined, return a hyphen
    if (!leadUserId || leadUserId.length === 0) {
      return '-';
    }

    // Filter the users array to find the matching user objects
    const leadUser = user.filter((u) => u.user_id === leadUserId);
    console.log(leadUser);

    // Map the found user objects to their usernames and join them with a comma and space
    const username = leadUser[0]?.username;
    console.log(username);

    return username;
  };

  const handleRegionChange = (selectedOptions) => {
    setSelectedRegion(selectedOptions);
  };

  const handleStatusChange = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
  }
  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };
  const toggleActionModal = (id) => {
    setIsActionModalOpen(!isActionModalOpen);
    setProjectId(id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatProjectId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `PRJ-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  const formatOpportunityId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `OPP-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center w-full">
        <p className="text-3xl font-bold text-blue-800 mb-4 ">Projects</p>
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
      <div className="relative overflow-x-auto shadow-md sm:rounded-t-lg ">
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
              placeholder="Search for Title"
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
              id="selectedStatus"
              value={selectedStatus}
              onChange={handleStatusChange}
              options={statusOptions}
              isMulti
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder="Status..."
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
                <div className="flex items-center justify-center gap-2">
                  <span>Project Id</span>
                  <div className="flex flex-col items-center text-xs">
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
                <div className="flex items-center justify-center gap-2">
                  <span>Project Title</span>
                  <div className="flex flex-col items-center text-xs">
                    <span
                      className={sortConfig.key === 'project_title' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('project_title', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'project_title' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('project_title', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span>Opportunity assigned</span>
                  <div className="flex flex-col items-center text-xs">
                    <span
                      className={sortConfig.key === 'oppurtunity_id' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('oppurtunity_id', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'oppurtunity_id' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('oppurtunity_id', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span>Cluster</span>
                  <div className="flex flex-col items-center text-xs">
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
                <div className="flex items-center justify-center gap-2">
                  <span>Region</span>
                  <div className="flex flex-col items-center text-xs invisible">
                    <FaSortUp fontSize="medium" />
                    <FaSortDown fontSize="medium" />
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span>Siglum</span>
                  <div className="flex flex-col items-center text-xs invisible">
                    <FaSortUp fontSize="medium" />
                    <FaSortDown fontSize="medium" />
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span>Led By</span>
                  <div className="flex flex-col items-center text-xs">
                    <span
                      className={sortConfig.key === 'projectLead' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('projectLead', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'projectLead' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('projectLead', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span>Created On</span>
                  <div className="flex flex-col items-center text-xs">
                    <span
                      className={sortConfig.key === 'created_on' && sortConfig.direction === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('created_on', 'asc')}
                      style={{ cursor: 'pointer', marginBottom: '-4px' }}
                    >
                      <FaSortUp fontSize="medium" />
                    </span>
                    <span
                      className={sortConfig.key === 'created_on' && sortConfig.direction === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-400'}
                      onClick={() => handleSort('created_on', 'desc')}
                      style={{ cursor: 'pointer', marginTop: '-4px' }}
                    >
                      <FaSortDown fontSize="medium" />
                    </span>
                  </div>
                </div>
              </th>

              <th scope="col" className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span>Mission Cards</span>
                  <div className="flex flex-col items-center text-xs invisible">
                    <FaSortUp fontSize="medium" />
                    <FaSortDown fontSize="medium" />
                  </div>
                </div>
              </th>

              {(currentUser.user.user_type === "Leader" || currentUser.user.user_type === "Admin") && (
                <th scope="col" className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span>Action</span>
                    <div className="flex flex-col items-center text-xs invisible">
                      <FaSortUp fontSize="medium" />
                      <FaSortDown fontSize="medium" />
                    </div>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>

            {currentItems &&
              currentItems.map((item) => (
                console.log(item.projectLead),
                <tr
                  key={item.id}
                  className={`border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-center`}
                >
                  <td
                    onClick={() => window.open(`opportunity-details/${item.oppurtunity_id}`, '_blank')}
                    className="flex items-center justify-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white text-center cursor-pointer"
                  >
                    <span className={`badge ${item.status ? 'badge-outline-info' : 'badge-outline-danger'} text-center`}>
                      {formatProjectId(item.id)}
                    </span>{" "}
                  </td>
                  <td className="px-6 py-4">{item.project_title}</td>

                  <td className="px-6 py-4">
                    {" "}
                    <span className="badge badge-outline-primary text-center">
                      {" "}
                      {formatOpportunityId(item.oppurtunity_id)}
                    </span>{" "}
                  </td>
                  <td className="px-6 py-4">{item.cluster || "-"}</td>
                  <td className="px-6 py-4">{item.region || "-"}</td>
                  <td className="px-6 py-4">{item.siglum || "-"}</td>
                  <td className="px-6 py-4">{getLeadUsername(item?.projectLead) || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(item.created_on)}
                  </td>
                  <td className="text-sm font-medium text-gray-400 flex justify-center items-center whitespace-nowrap">
                    <Dropdown
                      inline
                      label="Missions"
                      className="w-fit border rounded-md relative dropdown-menu"
                    >
                      {missionData &&
                        missionData
                          .filter(
                            (mission) =>
                              mission.missionCards &&
                              mission.missionCards.id === item.id
                          )
                          .map((filteredMission, index) => (
                            <Dropdown.Item
                              key={filteredMission.id}
                              value={filteredMission.id}
                              onClick={() =>
                                window.open(`/mission-details/${filteredMission.id}`, '_blank')
                              }
                            >
                              <span className="badge badge-outline-secondary text-center">
                                {filteredMission.airbusId}
                              </span>
                            </Dropdown.Item>
                          ))}
                    </Dropdown>
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

      {isActionModalOpen && (
        <ProjectModal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          projectId={projectId}
        />
      )}

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

export default Table;
