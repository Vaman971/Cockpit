import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Dropdown } from "flowbite-react";
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import ActionModal from "../../../components/Modal/OppActionModal";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ProjectModal from "../../../components/Modal/Update/ProjectUpdateModal";
import ReactPaginate from 'react-paginate';

const OpportunityProjectDetailModal = () => {
    const { opportunityId } = useParams();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [opportunityData, setOpportunityData] = useState(null);
    const [oppDescription, setoppDescription] = useState({})
    const [projectsData, setProjectsData] = useState([]);
    const [OpportunityId, setOpportunityId] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [expandedOpportunities, setExpandedOpportunities] = useState({});
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [expandedProjects, setExpandedProjects] = useState({});
    const [opportunitiesList, setOpportunitiesList] = useState([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState(opportunityId);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const [projectId, setProjectId] = useState(null);
    const [IsActionModalOpenProject, setIsActionModalOpenProject] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const itemsPerPage = 20;
    const [currentItems, setCurrentItem] = useState([]);

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            border: '2px solid gray',
            borderRadius: '0.375rem',
            padding: '0.25rem',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(29, 78, 216, 0.3)' : 'none',
            '&:hover': {
                borderColor: '#1D4ED8',
            },
            backgroundColor: 'transparent',
        }),
        input: (provided) => ({
            ...provided,
            color: '#1D4ED8',
            '& input': {
                boxShadow: 'none',
                caretColor: 'black',  // Custom caret color
                outline: 'none',        // Remove outline to get rid of the blue box
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'black',
            fontWeight: 'semibold',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'black',
            fontWeight: 'semibold',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#1D4ED8' : '#9CA3AF',
            '&:hover': {
                color: '#1D4ED8',
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#9CA3AF',
            '&:hover': {
                color: '#1D4ED8',
            },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#DBEAFE' : '#FFFFFF',
            color: '#1D4ED8',
            '&:hover': {
                backgroundColor: '#DBEAFE',
            },
        }),
        menuPortal: base => ({ ...base, zIndex: 9999 }),
    };


    const [missionData, setMissionData] = useState([]);
    const [MissionData, setmissionData] = useState(null)

    // useEffect(() => {
    //     const endOffset = itemOffset + itemsPerPage;
    //     setCurrentItem(data.slice(itemOffset, endOffset));
    //     setPageCount(Math.ceil(data.length / itemsPerPage));
    //   }, [itemOffset, itemsPerPage, data]);

    //   const handlePageClick = (e) => {
    //     const newOffset = e.selected * itemsPerPage;
    //     setItemOffset(newOffset); // Update item offset
    //     setCurrentPage(e.selected);
    //   };


    useEffect(() => {
        const fetchOpportunityData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/oppurtunities/getOpp/${selectedOpportunity}`, { withCredentials: true });
                const data = response.data;
                setOpportunityData(data);
                setoppDescription({ label: data?.OpDescription, value: data?.id });


            } catch (error) {
                toast.error("Failed to fetch data");
            }
        };
        const fetchProjectData = async () => {
            try {
                const opportunityResponse = await axios.get(`${apiUrl}/oppurtunities/getOpp/${selectedOpportunity}`, { withCredentials: true });
                const opportunityData = opportunityResponse.data;

                // Check the opportunity's status
                const opportunityStatus = opportunityData?.status;

                // Clear project data for certain statuses
                if (opportunityStatus === "prospection" || opportunityStatus === "proposal") {
                    console.log("No projects will be fetched for opportunities under prospection or proposal.");
                    setProjectsData([]);
                    setSelectedProject(null);
                    setExpandedProjects({});
                    return; // Exit early
                }

                // Fetch and set project data for other statuses
                const projectResponse = await axios.get(`${apiUrl}/project/getProjOpp/${selectedOpportunity}`, { withCredentials: true });
                const data = projectResponse.data;

                if (projectResponse.status === 200) {
                    setProjectsData(data[0]);
                    setSelectedProject(data[0]?.id);
                } else {
                    console.log("Failed to fetch projects:", projectResponse.data);
                    setProjectsData([]);
                    setSelectedProject(null);
                }
            } catch (error) {
                console.log("Failed to fetch project data:", error);
            }
        };


        const fetchOpportunitiesList = async () => {
            try {
                const response = await axios.get(`${apiUrl}/oppurtunities/getOpp`, { withCredentials: true });
                setOpportunitiesList(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                toast.error("Failed to fetch opportunities list");
            }
        };

        fetchOpportunityData();
        fetchOpportunitiesList();
        fetchProjectData();

    }, [selectedOpportunity, apiUrl]);

    const fetchMissionData = async () => {
        try {
            const missionResponse = await axios.get(`${apiUrl}/mission/getMissionByProjId/${selectedProject}`, { withCredentials: true });
            const data = missionResponse.data;


            if (missionResponse.status !== 200) {
                console.log(missionResponse.data);
            } else {
                // setMissionData(data);
                setMissionData((prevData) => ({ ...prevData, [selectedProject]: data }));
            }
            // setMissionData((prevData) => ({ ...prevData, [selectedProject]: missionResponse.data }));
        } catch (error) {
            console.log("Failed to fetch mission data", error);
        }
    };

    useEffect(() => {
        if (selectedProject) {
            fetchMissionData();
        }
    }, [selectedProject]);

    const toggleOpportunityExpand = (id) => {
        setExpandedOpportunities((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleProjectExpand = (id) => {
        setExpandedProjects((prev) => {
            const isExpanded = !prev[id];
            if (isExpanded && !missionData[id]) {
                fetchMissionData(id);
            }
            return { ...prev, [id]: isExpanded };
        });
    };

    const toggleActionModal = (id) => {
        setOpportunityId(id); // Set the ID here
        setIsActionModalOpen(!isActionModalOpen);
    };

    const toggleActionModalProject = (id) => {
        setIsActionModalOpenProject(!IsActionModalOpenProject);
        setProjectId(id);
    };

    const handleOpportunityChange = (event) => {
        setSelectedOpportunity(event.value);
        setoppDescription(event)
        // setExpandedOpportunities({});
        // setExpandedProjects({});
        // setMissionData({});

        setProjectsData([]);
        setSelectedProject(null);
        setExpandedProjects({});
        setMissionData({});

    };

    useEffect(() => {
        setProjectsData([]);
        setSelectedProject(null);
        setExpandedProjects({});
    }, [selectedOpportunity, apiUrl])


    const handleCloseModal = () => {
        setIsActionModalOpen(false);
        setIsDataModalOpen(false);
    };
    const handleProjectChange = (projectId) => {
        // Reset missions when switching projects
        setMissionData((prevData) => {
            const newData = { ...prevData };
            // delete newData[projectId]; // Clear previous data for the project
            return newData;
        });

        setSelectedProject(projectId);
        toggleProjectExpand(projectId);
        setIsExpanded((prev) => !prev);
    };


    return (
        <div className="flex min-h-[500px]">
            <div className="w-1/4 p-4 border-r bg-gray-50 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">Opportunities</h2>
                <div className="flex items-center gap-4 mb-4">
                    <Select
                        id="opportunitySelect"
                        label="Select Opportunity"
                        required
                        value={oppDescription}
                        onChange={handleOpportunityChange}
                        options={opportunitiesList.map((opp) => ({
                            value: opp.id,
                            label: opp.OpDescription,
                        }))}
                        styles={customStyles}
                        placeholder="-- Select Opportunity --"
                    />
                </div>

                {/* Opportunity List */}
                <ul className="mt-4 space-y-3">
                    {opportunityData && (
                        <li className="bg-blue-50 p-4 h-900 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex-grow">
                                <div className="flex items-center">
                                    <span
                                        onClick={() => toggleOpportunityExpand(selectedOpportunity)}
                                        className="cursor-pointer mr-2 text-lg text-blue-600"
                                    >
                                        {expandedOpportunities[selectedOpportunity] ? "▼" : "►"}
                                    </span>
                                    <span className="font-semibold text-blue-700 text-lg">{opportunityData.OpDescription}</span>
                                </div>

                                {/* Expandable Project and Mission Details */}
                                {expandedOpportunities[selectedOpportunity] && (
                                    <div className="mt-4">
                                        {opportunityData.status === "prospection" ? (
                                            <div className="text-blue-500 font-semibold">
                                                No projects or missions available for opportunities under prospection.
                                            </div>
                                        ) : (
                                            null
                                        )}
                                        <h3 className="font-semibold text-blue-700 mb-2">Projects</h3>
                                        <ul className="pl-4">
                                            {projectsData && (
                                                <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                                                    <span
                                                        onClick={() => handleProjectChange(projectsData?.id)}
                                                        className="font-semibold cursor-pointer text-lg text-blue-600"
                                                    >
                                                        {expandedProjects[selectedProject] ? "▼" : "►"}
                                                        <span className="ml-2">{projectsData?.project_title || "No projects available"}</span>
                                                    </span>
                                                </li>
                                            )}
                                        </ul>

                                        {/* Missions Section */}
                                        {expandedProjects[selectedProject] && (
                                            <div className="mt-4">
                                                {missionData[selectedProject] && missionData[selectedProject].length > 0 ? (
                                                    <div className="relative font-semibold text-blue-700 mb-2">
                                                        <Dropdown
                                                            inline
                                                            label="Select Mission"
                                                            className="w-full border rounded-md relative dropdown-menu"
                                                        >
                                                            {missionData[selectedProject].map((mission) => (
                                                                <Dropdown.Item
                                                                    key={mission.id}
                                                                    value={mission.id}
                                                                    onClick={() => window.open(`/mission-details/${mission.id}`, "_blank")}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="badge badge-outline-secondary text-center mr-4 text-blue-700 ">
                                                                            {mission.airbusId}
                                                                        </span>
                                                                        <span className="text-gray-700">{mission.missionDescription || "No Description"}</span>
                                                                    </div>
                                                                </Dropdown.Item>
                                                            ))}
                                                        </Dropdown>
                                                        {/* <ul className="list-disc pl-6 space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-white-300 hover:scrollbar-thumb-white-400 rounded-lg mt-2">
                                                            {missionData[selectedProject].map((mission) => (
                                                                <li
                                                                    key={mission.id}
                                                                    className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                                                                    onClick={() => window.open(`/mission-details/${mission.id}`)}
                                                                >
                                                                    <span className="font-semibold text-gray-700">
                                                                        {mission.missionDescription || "No Description"}
                                                                    </span>
                                                                    <span className="text-gray-500">{mission.airbusId}</span>
                                                                </li>
                                                            ))}
                                                        </ul> */}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500">No missions available.</p>
                                                )}
                                            </div>

                                        )}
                                    </div>
                                )}
                            </div>
                        </li>
                    )}
                </ul>
            </div>
            <div className="flex-grow p-8 relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg bg-white max-h-[90vh] scrollbar-thumb-size">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
                        Opportunity Details
                    </h1>
                    {opportunityData ? (
                        <div className="overflow-auto">
                            <table className="w-full border-collapse border border-gray-200 shadow-lg rounded-lg bg-white">
                                <thead>
                                    <tr className="text-center bg-blue-100 text-blue-800">
                                        <th className="py-3 px-4 border-b">Region</th>
                                        <th className="py-3 px-4 border-b">Customer Contact Point</th>
                                        <th className="py-3 px-4 border-b">Siglum</th>
                                        <th className="py-3 px-4 border-b">Cluster</th>
                                        <th className="py-3 px-4 border-b">Opportunity Description</th>
                                        <th className="py-3 px-4 border-b">Status</th>
                                        <th className="py-3 px-4 border-b">Led By</th>
                                        <th className="py-3 px-4 border-b">Latest Contact Date</th>
                                        <th className="py-3 px-4 border-b">Next Contact Date</th>
                                        <th className="py-3 px-4 border-b">Supported By</th>
                                        <th className="py-3 px-4 border-b">Action</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 border-b">{opportunityData.OpRegion || "N/A"}</td>
                                        <td className="py-3 px-4 border-b">{opportunityData.CustomerContactPoint || "N/A"}</td>
                                        <td className="py-3 px-4 border-b">{opportunityData.Siglum || "N/A"}</td>
                                        <td className="py-3 px-4 border-b">{opportunityData.cluster || "N/A"}</td>
                                        <td className="py-3 px-4 border-b">{opportunityData.OpDescription || "N/A"}</td>
                                        <td className="py-3 px-4 border-b">
                                            <span
                                                className={`inline-block px-3 py-1 badge border ${opportunityData.status === "Won"
                                                    ? "bg-success/20 text-success rounded-full"
                                                    : opportunityData.status === "Lost"
                                                        ? "bg-danger/20 text-danger rounded-full"
                                                        : opportunityData.status === "Hold"
                                                            ? "bg-warning/20 text-warning rounded-full"
                                                            : opportunityData.status === "Prospection"
                                                                ? "bg-primary/20 text-primary rounded-full"
                                                                : opportunityData.status === "Advanced"
                                                                    ? "bg-secondary/20 text-secondary rounded-full"
                                                                    : opportunityData.status === "Proposal"
                                                                        ? "bg-dark/20 text-dark rounded-full"
                                                                        : ""
                                                    }`}
                                            >
                                                {opportunityData.status || "N/A"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 border-b">{opportunityData.ledByUser?.username || "N/A"}</td>
                                        <td className="py-3 px-4 border-b">{opportunityData.LatestContactDate || "N/A"}</td>
                                        <td className="py-3 px-4 border-b">{opportunityData.NextContactDate || "N/A"}</td>
                                        <td className="py-3 px-4 border-b">{opportunityData.supportedByUser?.username || "N/A"}</td>
                                        {(currentUser.user.user_type === "Leader" ||
                                            currentUser.user.user_type === "Admin") && (
                                                <td className="text-center">
                                                    <button
                                                        className="text-blue-600 dark:text-blue-500 hover:underline"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click from firing
                                                            toggleActionModal(opportunityData.id);
                                                        }}
                                                    >
                                                        <EditNoteIcon />
                                                    </button>
                                                </td>
                                            )}
                                    </tr>
                                </tbody>
                                {isActionModalOpen && (
                                    <ActionModal
                                        isOpen={isActionModalOpen}
                                        onClose={handleCloseModal}
                                        opportunityId={opportunityId}
                                    />
                                )}
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No opportunity selected.</p>
                    )}
                </div>

                <div>
                    {isExpanded && selectedProject && (
                        <div>
                            <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">Project Details</h1>
                            <div className="overflow-auto">
                                <table className="w-full border-collapse border border-gray-200 shadow-lg rounded-lg bg-white">
                                    <thead>
                                        <tr className="text-center bg-blue-100 text-blue-800">
                                            <th className="py-3 px-4 border-b">Project id</th>
                                            <th className="py-3 px-4 border-b">Region</th>
                                            <th className="py-3 px-4 border-b">Project Title</th>
                                            <th className="py-3 px-4 border-b">Cluster</th>
                                            <th className="py-3 px-4 border-b">Siglum</th>
                                            <th className="py-3 px-4 border-b">Oppprtunity Assigned</th>
                                            <th className="py-3 px-4 border-b">Created On</th>
                                            <th className="py-3 px-4 border-b">Updated On</th>
                                            <th className="py-3 px-4 border-b">Status</th>
                                            <th className="py-3 px-4 border-b">Action</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-center border-b hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 border-b">{projectsData.id || "N/A"}</td>
                                            <td className="py-3 px-4 border-b">{projectsData.region || "N/A"}</td>
                                            <td className="py-3 px-4 border-b">{projectsData.project_title || "N/A"}</td>
                                            <td className="py-3 px-4 border-b">{projectsData.cluster || "N/A"}</td>
                                            <td className="py-3 px-4 border-b">{projectsData.siglum || "N/A"}</td>
                                            <td className="py-3 px-4 border-b">{projectsData.oppurtunity_id || "N/A"}</td>
                                            <td className="py-3 px-4 border-b">{new Date(projectsData.created_on).toLocaleDateString() || "N/A"}</td>
                                            <td className="py-3 px-4 border-b">{new Date(projectsData.updated_on).toLocaleDateString() || "N/A"}</td>
                                            <td className="py-3 px-4 border-b">{projectsData.status ? "Active" : "Inactive"}</td>
                                            {(currentUser.user.user_type === "Leader" ||
                                                currentUser.user.user_type === "Admin") && (
                                                    <td>
                                                        <button
                                                            className="text-blue-600 dark:text-blue-500 hover:underline"
                                                            onClick={() => toggleActionModalProject(projectsData.id)}
                                                        >
                                                            <EditNoteIcon />
                                                        </button>
                                                    </td>
                                                )}
                                        </tr>
                                    </tbody>
                                    {IsActionModalOpenProject && (
                                        <ProjectModal
                                            isOpen={IsActionModalOpenProject}
                                            onClose={() => setIsActionModalOpenProject(false)}
                                            projectId={projectId}
                                        />
                                    )}
                                </table>
                            </div>
                            {expandedProjects[selectedProject] && (
                                <div className="mt-6">
                                    <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">Mission Details</h1>
                                    <table className="w-full border-collapse border border-gray-200 shadow-lg rounded-lg bg-white">
                                        <thead>
                                            <tr className="text-center bg-blue-100 text-blue-800">
                                                <th className="py-3 px-4 border-b">Airbus ID</th>
                                                <th className="py-3 px-4 border-b">Description</th>
                                                <th className="py-3 px-4 border-b">Leader</th>
                                                <th className="py-3 px-4 border-b">Siglum</th>
                                                <th className="py-3 px-4 border-b">Cluster</th>
                                                <th className="py-3 px-4 border-b">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {missionData[selectedProject] && missionData[selectedProject].length > 0 ? (
                                                missionData[selectedProject].map((mission) => (
                                                    <tr key={mission.id} className="text-center border-b hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-4 border-b">{mission.airbusId || "N/A"}</td>
                                                        <td className="py-3 px-4 border-b cursor-pointer"
                                                            onClick={() => {
                                                                window.open(`/mission-details/${mission.id}`)
                                                            }}
                                                        >{mission.missionDescription || "No Description"}</td>
                                                        <td className="py-3 px-4 border-b cursor-pointer hover:underline"
                                                            onClick={() => {
                                                                window.open(`/users/profile/${mission.assignedMissionCards.user_id}`)
                                                            }}
                                                        >{mission.assignedMissionCards?.username || "NA"}</td>
                                                        <td className="py-3 px-4 border-b">{mission.siglum}</td>
                                                        <td className="py-3 px-4 border-b">{mission.cluster}</td>

                                                        <td className="py-3 px-4 border-b">{mission.status ? "Active" : "Inactive"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4 text-gray-500">
                                                        No missions available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};
export default OpportunityProjectDetailModal;
