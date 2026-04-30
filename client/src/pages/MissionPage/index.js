import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import InvoiceModal from "../../components/Modal/InvoiceModal";
import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import axios from "axios";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles
import AddTeam from "../../components/Modal/TeamModal";
import AddUser from "../../components/Modal/TeamModal/members";
import PoUpdate from "../../components/Modal/Update/PurchaseUpdateModal";
import MissUpdate from "../../components/Modal/Update/MissionUpdateModal";
import CustomerUpdateModal from "../../components/Modal/Update/CustomerUpdateModal";
import SharePointModal from "../../components/Modal/SharePointModal";
import ViewDocLinkModal from "../../components/Modal/ViewDocLinkModal";
import ArticleIcon from '@mui/icons-material/Article';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const MissionPage = () => {
    const { missionId } = useParams();
    const [customerId, setCustomerId] = useState("");
    const [missionData, setMissionData] = useState(null);
    const [teamsData, setTeamsData] = useState([]);
    const [missionLeaders, setMissionLeaders] = useState([]);
    const [selectedMission, setSelectedMission] = useState('');
    const [missionName, setMissionName] = useState({});
    const [leaderName, setLeaderName] = useState({});
    const [isInvoiceModelOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceIdToDelete, setInvoiceIdToDelete] = useState("");
    const { currentUser } = useSelector((state) => state.user);
    const [showModal, setShowModal] = useState(false);
    const [poData, setPoData] = useState([]);
    const [customerData, setCustomerData] = useState([]);
    const [poId, setPoId] = useState("")
    const [userIdToDelete, setUserIdToDelete] = useState("");
    const [teamIdToDelete, setTeamIdToDelete] = useState("");
    const [InvoiceData, setInvoiceData] = useState([])
    const [selectedLeader, setSelectedLeader] = useState("");
    const [allMissions, setAllMissions] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);
    const [MissionId, setMissionId] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editingTeamId, setEditingTeamId] = useState(null);
    const [editingOccupancy, setEditingOccupancy] = useState("");
    const [teamStatus, setTeamStatus] = useState(true);
    const [updatedMonth, setUpdatedMonth] = useState('');
    const [updatedForecast, setUpdatedForecast] = useState('');
    const [updatedInvoice, setUpdatedInvoice] = useState('');
    const [initialMonthValue, setInitialMonthValue] = useState('');
    const [teamId, setTeamId] = useState('');
    const [showTeamModal, setShowTeamModal] = useState('');
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [teamMemberModal, setTeamMemberModal] = useState(false);
    const [initialforecastInvoice, setinitialforecastInvoice] = useState('');
    const [initialInvoicedAmount, setinitialInvoicedAmount] = useState('');
    const [isPoEditModalOpen, setIsPoEditModalOpen] = useState(false)
    const [originalOccupancy, setOriginalOccupancy] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [showUpdateMessage, setShowUpdateMessage] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null); // State to hold selected project
    const [isCustomerEditModalOpen, setIsCustomerEditModalOpen] = useState(false);
    const [projectData, setProjectData] = useState(null);
    const [projectOptions, setProjectOptions] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

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


    const toggleRowExpansion = (poId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [poId]: !prev[poId], // Toggle the expansion of the row
        }));
        setPoId(poId)
    };


    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(
                `${apiUrl}/invoice/getInvoiceByPoId/${poId}`,
                { withCredentials: true }
            );
            const responseData = res.data;
            if (responseData.success === false) {
                console.log(responseData.message);
            } else {
                setInvoiceData(responseData); // Updated state for InvoiceData
            }
        } catch (error) {
            console.log(error.message);
        }
    }, [apiUrl, poId]);

    useEffect(() => {
        fetchData(); // Fetch data when component mounts or poId changes
    }, [fetchData, showModal]);

    const handleEditField = (invoiceId, field, value) => {
        setEditingInvoiceId(invoiceId);
        setEditingField(field);

        if (field === 'month') {
            setInitialMonthValue(value);
            setUpdatedMonth(value);
        } else if (field === 'forecast') {
            setinitialforecastInvoice(value);
            setUpdatedForecast(value);
        } else if (field === 'invoice') {
            setinitialInvoicedAmount(value);
            setUpdatedInvoice(value);
        }
    };

    const handleSaveField = async () => {
        let updatedData = {};
        let shouldUpdate = false; // Track if we should update

        if (editingField === 'month' && updatedMonth !== initialMonthValue) {
            updatedData.invoiceDate = updatedMonth;
            shouldUpdate = true;
        } else if (editingField === 'forecast' && updatedForecast !== initialforecastInvoice) {
            updatedData.forecastAmount = updatedForecast;
            shouldUpdate = true;
        } else if (editingField === 'invoice' && updatedInvoice !== initialInvoicedAmount) {
            updatedData.invoiceAmount = updatedInvoice;
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            try {
                const response = await axios.put(
                    `${apiUrl}/invoice/updateInvoice/${editingInvoiceId}`,
                    updatedData,
                    { withCredentials: true }
                );

                if (response.status === 200) {
                    toast.success("Invoice updated successfully");
                    setEditingInvoiceId(null);
                    setEditingField(null);
                    fetchData(); // Refresh data after update
                } else {
                    throw new Error(response.data.message || "Unknown error occurred");
                }
            } catch (error) {
                toast.error("Failed to update the invoice: " + error.message);
                console.error("Update Error:", error.response?.data || error.message);
            }
        } else {
            setEditingInvoiceId(null);
            setEditingField(null);
        }
    };

    const handleKeyDown = (e, invoiceId, field) => {
        if (e.key === 'Enter') {
            handleSaveField(invoiceId, field);
        }
    };

    const handleEditOccupancy = (teamId, userId, currentOccupancy) => {
        setEditingUserId(userId);
        setEditingTeamId(teamId);
        setEditingOccupancy(currentOccupancy);
        setOriginalOccupancy(currentOccupancy);
        setShowUpdateMessage(false);
    };


    const handleOccupancyKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSaveOccupancy();
            setEditingUserId(null);
            setEditingTeamId(null);
        }
    };

    const toggleActionModal = (id) => {
        setMissionId(id);
        setIsActionModalOpen(!isActionModalOpen);
    };


    const handleDeleteInvoice = async () => {
        try {
            const res = await axios.delete(`${apiUrl}/invoice/deleteInvoiceById/${invoiceIdToDelete}`, { withCredentials: true });

            setInvoiceData((prevInvoices) => prevInvoices.filter(invoice => invoice.invoiceIdToDelete !== invoiceIdToDelete));

            if (res.status !== 200) {
                toast.error(`Failed to delete the Invoice.`);
            } else {
                toast.success("Invoice Deleted Successfully");
                setShowModal(false);
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };

    const handleTeamCreation = () => {
        setTeamModalOpen(true);
    };


    const handleDelete = (id) => {
        setShowModal(true);
        setInvoiceIdToDelete(id);
    };

    const handleViewLinks = () => {
        setIsViewModalOpen(true);
    };

    const handleUploadLink = () => {
        setIsUploadModalOpen(true);
    };

    const handleDeleteUserTeam = (teamId, userId) => {
        setShowTeamModal(true);
        setUserIdToDelete(userId);
        setTeamIdToDelete(teamId);
    };

    const handlePurchaseOrder = (id) => {
        setPoId(id);
        setIsPoEditModalOpen(true);
    }


    const handleTeamMembers = () => {
        setTeamMemberModal(true);
    };
    const handleDeleteUser = async () => {
        try {
            const res = await axios.delete(
                `${apiUrl}/teams/deleteTeamMembers/${teamIdToDelete}/${userIdToDelete}`,
                { withCredentials: true }
            );
            const data = res.data;
            if (data.success === false) {
                toast.error(`Failed to delete the User.`);
            } else {
                toast.success("User Deleted Successfully");
                setShowTeamModal(false);
            }
        } catch (error) {
            toast.error(`Failed to delete the User.`);
        }
    };

    const handleInvoiceModal = async () => {
        try {
            const newInvoice = {
                invoiceDate: '',
                invoiceAmount: 0,
                forecastAmount: 0,
            };
            const res = await axios.post(
                `${apiUrl}/invoice/createInvoiceByPoId/${poId}`,
                newInvoice,
                {
                    withCredentials: true,
                }
            );
            const data = res.data;
            if (data.success === false) {
                console.log(data.message);
                toast.error("Error Creating Invoice!!")
                return;
            } else {
                fetchData();
                toast.success("Invoice created Successfully!!");
            }
        } catch (error) {
            toast.error("All Fields are Required!!")
        }
    };


    const fetchMissionTeams = async () => {
        try {
            const response = await axios.get(`${apiUrl}/teams/getTeam/${missionId}`, {
                withCredentials: true,
            });
            const teams = response.data;
            if (response.status === 200) {
                setTeamsData(teams.Profiles);
                setTeamId(teams.id);
                setTeamStatus(teams.active);
            } else {
                console.log(teams.message);
            }
        } catch (error) {
            console.error("Error fetching mission teams:", error.message);
        }
    };


    const fetchMissionDetails = async () => {
        try {
            const response = await axios.get(`${apiUrl}/mission/getMission/${missionId}`, {
                withCredentials: true,
            });
            const missionData = response.data;
            if (missionData.success === false) {
                console.log(missionData.message);
            } else {
                setMissionData(missionData);
                setPoData(missionData?.projectPo);
                setSelectedLeader(missionData?.assignedMissionCards?.user_id); // Set leader
                setLeaderName({ label: missionData?.assignedMissionCards?.username, value: missionData?.assignedMissionCards?.user_id });
                setSelectedMission(missionData.id); // Set mission
                setMissionName({ label: (missionData?.airbusId + '-' + missionData?.missionDescription) || 'AirbusId Undefined', value: missionData?.id });
                setCustomerId(missionData?.customer_Id);
            }
        } catch (error) {
            console.error("Error fetching mission details:", error.message);
        }
    };

    const fetchAllProjects = async () => {
        try {
            // Make the API request to fetch all projects
            const response = await axios.get(`${apiUrl}/project/getAllProjects`, {
                withCredentials: true, // Include credentials if needed
            });

            const projectsData = response.data;
            console.log("Fetched All Projects:", projectsData);

            // Check if the API returned a success response
            if (projectsData.success === false) {
                console.log(projectsData.message);
            } else {
                // Transform the projects data into options for the dropdown
                const projectOptions = projectsData.projects.map(project => ({
                    label: ` ${project.project_title}`,
                    // value: project.id,
                }));

                // Update the state with the project options
                setProjectOptions(projectOptions); // Assuming setProjectOptions is your state setter function
            }
        } catch (error) {
            console.error("Error fetching all projects:", error.message);
        }
    };

    const fetchAllCustomers = async () => {
        try {
            // Make the API request to fetch all projects
            const response = await axios.get(`${apiUrl}/customer/getCustomerByMissionId/${missionId}`, {
                withCredentials: true, // Include credentials if needed
            });

            const customersData = response.data;
            console.log("Fetched All Customers:", customersData);

            // Check if the API returned a success response
            if (customersData.success === true) {
                setCustomerData(customersData.customers);
                // const allCustomerIds = customersData.customers.map(customer => customer.customer_id);
                setCustomerId(customerData.customer.customer_id);
            } else {
                console.log(customersData.message);
            }
        }
        catch (error) {
            console.error("Error fetching all customers:", error.message);
        }
    };




    useEffect(() => {
        fetchAllProjects();
    }, [])


    useEffect(() => {
        fetchMissionDetails();
        fetchMissionTeams();
        fetchAllCustomers();

    }, [missionId, apiUrl, selectedMission, showTeamModal, teamModalOpen, teamMemberModal, isPoEditModalOpen, isCustomerEditModalOpen]);


    // Fetch all mission leaders
    useEffect(() => {
        const fetchMissionLeaders = async () => {
            try {
                const response = await axios.get(`${apiUrl}/users/getUserDetails`, {
                    withCredentials: true,
                });
                const data = response.data;
                if (response.status === 200) {
                    setMissionLeaders(data.filter((value) => value.user_type !== 'Reader')); // Filter out readers
                }
            } catch (error) {
                console.error("Error fetching mission leaders:", error.message);
            }
        };
        fetchMissionLeaders();
    }, [apiUrl]);

    const fetchMissionsForLeader = async () => {
        if (!selectedLeader) return;
        try {
            // console.log("Selected Leader ID:", selectedLeader);
            const response = await axios.get(`${apiUrl}/users/getmissionDetails`, {
                params: { leader: selectedLeader },
                withCredentials: true,
            });

            const data = response.data.missions;
            // console.log("Missions Response Data:", data);

            if (response.status === 200 && Array.isArray(data)) {
                // Filter out missions with null airbusId
                const validMissions = data.filter(mission => mission.airbusId);
                setAllMissions(validMissions);
            } else {
                console.log("Invalid response format, expected an array");
                setAllMissions([]);
            }
        } catch (error) {
            setAllMissions([]);
            console.error("Error fetching missions for leader:", error.message);
        }
    };

    useEffect(() => {
        fetchMissionsForLeader();
    }, [selectedLeader, apiUrl]);

    useEffect(() => {
        const fetchInvoiceforPo = async () => {
            if (!poData) return;
            try {

                const response = await axios.get(`${apiUrl}/invoice/getInvoiceByPoId/${poId}`, {
                    withCredentials: true,
                });

                const data = response.data;
                // console.log("Missions Response Data:", data);

                if (response.status === 200 && Array.isArray(data)) {
                    setInvoiceData(data);
                } else {
                    console.log("Invalid response format, expected an array");
                    setInvoiceData([]);
                }
            } catch (error) {
                console.error("Error fetching invoives:", error.message);
            }
        };
        fetchInvoiceforPo();
    }, [poId, apiUrl])


    const handleSaveOccupancy = async () => {
        if (editingOccupancy === "") {
            setEditingUserId(null);
            setEditingTeamId(null);
            return;
        }
        if (editingOccupancy !== originalOccupancy) {
            try {
                const res = await axios.put(
                    `${apiUrl}/teams/updateUserTeams/${editingTeamId}/${editingUserId}`,
                    { occupancy: editingOccupancy },
                    { withCredentials: true }
                );
                if (res.data.success === false) {
                    toast.error("Failed to update occupancy.");
                } else {
                    toast.success("Occupancy Updated Successfully");
                    setEditingUserId(null);
                    setEditingTeamId(null);
                    fetchMissionTeams();
                }
            } catch (error) {
                toast.error(error.response.data.error);
            }
        } else {
            setEditingUserId(null);
            setEditingTeamId(null);
        }
    };

    // Handle mission change and navigate
    const handleMissionChange = (selectedOption) => {
        setSelectedMission(selectedOption.value);
        navigate(`/mission-details/${selectedOption.value}`);
    };

    const handleAddCust = () => {
        window.open(`/customers`, "_blank"); // redirects to add customer pg
    };

    const handleCustNameClick = (customerId) => {
        window.open(`/customerDetails/${customerId}`, "_blank");
    };

    const handleOpenCustomerModal = (id) => {
        setCustomerId(id);
        setIsCustomerEditModalOpen(true);
    };

    const handleProjectChange = (selectedOption) => {
        setSelectedProject(selectedOption);
    };

    const handleModalClose = () => {
        setIsActionModalOpen(false);
        fetchMissionDetails();
    };

    const getCurrencySymbol = (currencyCode) => {
        switch (currencyCode) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'INR': return '₹';
            case 'RON': return 'lei';
            default: return '';
        }
    };

    // Handle leader change
    const handleLeaderChange = (selectedOption) => {
        setSelectedLeader(selectedOption.value);
        setLeaderName(selectedOption);
        // console.log("Leader Changed:", e.target.value);
    };

    if (!missionData) {
        return <div className="text-center py-10 text-gray-600">Loading mission details...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="w-1/4 p-6 bg-white shadow-lg space-y-6 rounded-lg border border-gray-200">

                {/* <label htmlFor="projectSelect" className="block text-lg font-bold text-blue-900 mt-4">
                    Select Project:
                </label>
                {/* Only render Select when projectOptions is populated */}
                {/* {projectOptions.length > 0 ? (
                    <Select
                        id="projectSelect"
                        value={selectedProject}
                        onChange={handleProjectChange}
                        options={projectOptions} // Passing the projectOptions here
                        styles={customStyles}
                        placeholder="Select a Project"
                    />
                ) : (
                    <p>Loading projects...</p> // Or any other loading state message
                )} */}

                <label
                    htmlFor="missionCardLeader"
                    className="block text-lg font-bold text-blue-900"
                >
                    Mission Execution Lead:
                </label>

                <Select
                    id="missionCardLeader"
                    label="Mission Execution Lead"
                    required
                    value={leaderName}
                    onChange={handleLeaderChange}
                    options={missionLeaders && missionLeaders.map(leader => ({ value: leader.user_id, label: leader.username }))}
                    styles={customStyles}
                    placeholder="Select the Lead"
                />

                <label
                    htmlFor="missionSelect"
                    className="block text-lg font-bold text-blue-900"
                >
                    Select Mission:
                </label>

                <Select
                    id="missionSelect"
                    value={missionName}
                    onChange={handleMissionChange}
                    options={Array.isArray(allMissions) && allMissions.length > 0
                        ? allMissions.map(mission => ({
                            value: mission.id,
                            label: mission.airbusId
                                ? `${mission.airbusId} - ${mission.missionDescription || 'NA'}`
                                : 'NA'
                        }))
                        : [{ value: '', label: 'No missions available', isDisabled: true }]
                    }
                    styles={customStyles}
                    placeholder="Select a mission"
                />

                <div className="flex space-x-4">
                    <button
                        className="cursor-pointer border bg-green-100 text-green-700 rounded-full px-6 py-2 text-base w-full sm:w-48 md:w-56 lg:w-64 flex items-center justify-center gap-2 hover:bg-green-200 transition-all"
                        type="button"
                        onClick={handleViewLinks}
                    >
                        View URL <ArticleIcon fontSize="small" />
                    </button>
                </div>
                <div>
                    <button
                        className="cursor-pointer border bg-blue-100 text-blue-700 rounded-full px-6 py-2 text-base w-full sm:w-48 md:w-56 lg:w-64 flex items-center justify-center gap-2 hover:bg-blue-200 transition-all"
                        type="button"
                        onClick={handleUploadLink}
                    >
                        Add URL <AttachFileIcon fontSize="small" />
                    </button>
                </div>
            </div>

            <div className="w-full p8 bg-white rounded-lg shadow-2xl mx-4 mt-2">
                <div className="overflow-x-auto mt-8 mx-4">
                    <h2 className="text-2xl font-bold text-blue-900 mb-4 mt-4">Mission Details</h2>
                    <table className="w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="text-center bg-gray-100 border-b">
                                <th className="py-3 px-3 border-b font-bold text-blue-700">Mission ID</th>
                                <th className="py-3 px-3 border-b font-bold text-blue-700">Description</th>
                                <th className="py-3 px-3 border-b font-bold text-blue-700">Leader</th>
                                <th className="py-3 px-3 border-b font-bold text-blue-700">Start Date</th>
                                <th className="py-3 px-3 border-b font-bold text-blue-700">End Date</th>
                                <th className="py-3 px-3 border-b font-bold text-blue-700">Duration</th>
                                <th className="py-3 px-3 border-b font-bold text-blue-700">Status</th>
                                <th className="py-3 px-3 border-b font-bold text-blue-700">Cluster</th>
                                <th className="py-3 px-3 border-b font-bold text-blue-700">Siglum</th>
                                {(currentUser.user.user_type === "Leader" ||
                                    currentUser.user.user_type === "Admin") && (
                                        <th scope="col" className="py-3 px-3 border-b font-bold text-blue-700">
                                            Action
                                        </th>
                                    )}
                                {/* <th className="py-3 px-3 border-b font-bold text-blue-700">Delivery Notes</th> */}
                                {/* <th className="py-3 px-3 border-b font-bold text-blue-700">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-center border-b hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 border-b">{missionData?.airbusId || "Not Specified"}</td>
                                <td className="py-3 px-4 border-b">{missionData?.missionDescription || "Not Specified"}</td>
                                <td className="py-3 px-4 border-b">{missionData?.assignedMissionCards?.username || "Not Specified"}</td>
                                <td className="py-3 px-4 border-b">{missionData?.missionStartDate || "Not Specified"}</td>
                                <td className="py-3 px-4 border-b">{missionData?.missionEndDate || "Not Specified"}</td>
                                <td className="py-3 px-4 border-b">
                                    {calculateMissionDuration(missionData?.missionStartDate, missionData?.missionEndDate)} months
                                </td>
                                <td className="py-3 px-4 border-b">{missionData?.status || "Not Specified"}</td>
                                <td className="py-3 px-4 border-b">{missionData?.cluster || "Not Specified"}</td>
                                <td className="py-3 px-4 border-b">{missionData?.siglum || "Not Specified"}</td>
                                {(currentUser.user.user_type === "Leader" ||
                                    currentUser.user.user_type === "Admin") && (
                                        <td>
                                            <button
                                                className="text-blue-600 dark:text-blue-500 hover:underline"
                                                onClick={() => toggleActionModal(missionData.id)}
                                            >
                                                <EditNoteIcon />
                                            </button>
                                        </td>
                                    )}
                                {/* <td className="py-3 px-4 border-b">{"No Delivery Notes"}</td> */}

                            </tr>
                        </tbody>
                    </table>
                </div>
                {isActionModalOpen && (
                    <MissUpdate
                        isOpen={isActionModalOpen}
                        onClose={handleModalClose}
                        missionId={missionId}

                    />
                )}

                <div className="overflow-x-auto mt-8 mx-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-blue-900">Customer Details</h2>
                        <button
                            id="actionButton"
                            className="inline-flex items-center text-white bg-blue-800 border border-gray-300 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-blue-700 dark:focus:ring-blue-700 ml-8 mb-1.5"
                            type="button"
                            onClick={() => handleAddCust(true)}
                        >
                            Go To Customer Table
                        </button>
                    </div>
                    <div>
                        <table className="w-full bg-white border border-gray-300">
                            <thead>
                                <tr className="text-center bg-gray-100 border-b">
                                    <th className="py-3 px-3 border-b font-bold text-blue-700">First Name</th>
                                    <th className="py-3 px-3 border-b font-bold text-blue-700">Last Name</th>
                                    <th className="py-3 px-3 border-b font-bold text-blue-700">Siglum</th>
                                    <th className="py-3 px-3 border-b font-bold text-blue-700">Site</th>
                                    <th className="py-3 px-3 border-b font-bold text-blue-700">Email</th>
                                    <th className="py-3 px-3 border-b font-bold text-blue-700">Contact No.</th>
                                    {(currentUser.user.user_type === "Leader" ||
                                        currentUser.user.user_type === "Admin") && (
                                            <th scope="col" className="py-3 px-3 border-b font-bold text-blue-700">
                                                Action
                                            </th>
                                        )}
                                </tr>
                            </thead>
                            <tbody>
                                {customerData.map((customer) => (
                                    <tr key={customer.customer_id} className="text-center border-b hover:bg-gray-50 transition-colors"
                                        onClick={() => handleCustNameClick(customer.customer_id)}>
                                        <td className="py-3 px-4 border-b">{customer.first_name || "Not Specified"}</td>
                                        <td className="py-3 px-4 border-b">{customer.last_name || "Not Specified"}</td>
                                        <td className="py-3 px-4 border-b">{customer.siglum || "Not Specified"}</td>
                                        <td className="py-3 px-4 border-b">{customer.site || "Not Specified"}</td>
                                        <td className="py-3 px-4 border-b">{customer.email || "Not Specified"}</td>
                                        <td className="py-3 px-4 border-b">{customer.phone || "Not Specified"}</td>
                                        <td
                                            className="py-3 px-4 border-b"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                className="text-blue-600 dark:text-blue-500 hover:underline"
                                                onClick={() => handleOpenCustomerModal(customer.customer_id)}
                                            >
                                                <EditNoteIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </div>
                {
                    isCustomerEditModalOpen && (
                        <CustomerUpdateModal
                            customerId={customerId}
                            isOpen={isCustomerEditModalOpen}
                            closeModal={() => setIsCustomerEditModalOpen(false)}
                        />
                    )
                }


                <div className="overflow-x-auto mt-8 mx-4">
                    {(currentUser.user.user_type === "Leader" || currentUser.user.user_type === "Admin") && (
                        <>
                            <h2 className="text-2xl font-bold text-blue-900 mb-4 mt-4">Purchase Order</h2>
                            <table className="w-full bg-white border border-gray-300">
                                <thead>
                                    <tr className="text-center bg-gray-100 border-b">
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">PO ID</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">Description</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">PO Number</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">PO Date</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">PO Amount</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">Forecasted Invoice</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">Amount Delivered</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">Status</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">Cluster</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">Siglum</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">Delivery Notes</th>
                                        <th className="py-3 px-3 border-b font-bold text-blue-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {poData && poData.map((po, index) => (
                                        <React.Fragment key={po.id || index}>
                                            <tr className="text-center border-b hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 border-b">{po.id || "N/A"}</td>
                                                <td className="py-3 px-4 border-b">{po.poDescription || "N/A"}</td>
                                                <td className="py-3 px-4 border-b">{po.poNumber || "-"}</td>
                                                <td className="py-3 px-4 border-b">{po.poDate || "-"}</td>
                                                <td className="py-3 px-4 border-b"> {po.poAmount ? `${getCurrencySymbol(po.currencyCode)}${po.poAmount}` : "-"}</td>
                                                <td className="py-3 px-4 border-b">{po.poForecast || "-"}</td>
                                                <td className="py-3 px-4 border-b">{po.poPrice || "-"}</td>
                                                <td className="py-3 px-4 border-b">
                                                    <span
                                                        className={`inline-block px-3 py-1 badge border
                                                   ${po.poStatus === "pending"
                                                                ? "bg-yellow-100 text-yellow-800 rounded-full"
                                                                : po.poStatus === "closed"
                                                                    ? "bg-green-100 text-green-800 rounded-full"
                                                                    : po.poStatus === "open"
                                                                        ? "bg-blue-100 text-blue-800 rounded-full"
                                                                        : "bg-red-100 text-red-800 rounded-full"
                                                            }`}
                                                    >
                                                        {po.poStatus || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 border-b">{missionData?.cluster || "N/A"}</td>
                                                <td className="py-3 px-4 border-b">{missionData?.siglum || "N/A"}</td>
                                                <td className="py-3 px-4 border-b">
                                                    <button onClick={() => toggleRowExpansion(po.id)}>
                                                        {expandedRows[po.id] ? (
                                                            <ChevronUpIcon className="w-5 h-5 text-blue-600" />
                                                        ) : (
                                                            <ChevronDownIcon className="w-5 h-5 text-blue-600" />
                                                        )}
                                                    </button>
                                                </td>

                                                <td className="py-3 px-4 border-b">
                                                    <button
                                                        onClick={() => handlePurchaseOrder(po.id)} // Set selected PO
                                                        className="text-blue-600 dark:text-blue-500 hover:underline">
                                                        <EditNoteIcon />
                                                    </button>
                                                </td>

                                            </tr>
                                            {expandedRows[po.id] && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan="10" className="py-3 px-4 border-b">
                                                        <div className="flex flex-col space-y-2">
                                                            {InvoiceData && InvoiceData.length > 0 ? (
                                                                <table className="min-w-full bg-white border border-gray-300">
                                                                    <thead>
                                                                        <tr className="text-center bg-gray-100">
                                                                            <th className="py-2 px-4 border-b text-blue-700">Delivery Month</th>
                                                                            <th className="py-2 px-4 border-b text-blue-700">Forecasted Invoice</th>
                                                                            <th className="py-2 px-4 border-b text-blue-700">Invoiced Amount</th>
                                                                            <th className="py-2 px-4 border-b text-blue-700">Delete</th>

                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {InvoiceData.map((invoice, index) => (
                                                                            <tr key={index} className="text-center border-b">
                                                                                <td className="py-2 px-4">
                                                                                    {editingInvoiceId === invoice.id && editingField === 'month' ? (
                                                                                        <DatePicker
                                                                                            selected={updatedMonth ? new Date(updatedMonth) : null}
                                                                                            onChange={(date) => {
                                                                                                setUpdatedMonth(date);
                                                                                            }}
                                                                                            className="border rounded p-1"
                                                                                            onKeyDown={(e) => handleKeyDown(e, invoice.id, 'month')}
                                                                                            onBlur={() => handleSaveField(invoice.id, 'month')}
                                                                                            dateFormat="MMMM d, yyyy" // Customize the date format as needed
                                                                                            placeholderText="Select a month"
                                                                                            showPopperArrow={false}
                                                                                        />
                                                                                    ) : (
                                                                                        <span onClick={() => handleEditField(invoice.id, 'month', invoice.invoiceDate)}>
                                                                                            {invoice.invoiceDate || "N/A"}
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="py-2 px-4">
                                                                                    {editingInvoiceId === invoice.id && editingField === 'forecast' ? (
                                                                                        <input
                                                                                            type="text"
                                                                                            value={updatedForecast}
                                                                                            onChange={(e) => setUpdatedForecast(e.target.value)}
                                                                                            className="border rounded p-1"
                                                                                            onBlur={() => handleSaveField(invoice.id, 'forecast')}
                                                                                            onKeyDown={(e) => handleKeyDown(e, invoice.id, 'forecast')}
                                                                                        />
                                                                                    ) : (
                                                                                        <span onClick={() => handleEditField(invoice.id, 'forecast', invoice.forecastAmount)}>
                                                                                            {invoice.forecastAmount || "-"}
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="py-2 px-4">
                                                                                    {editingInvoiceId === invoice.id && editingField === 'invoice' ? (
                                                                                        <input
                                                                                            type="text"
                                                                                            value={updatedInvoice}
                                                                                            onChange={(e) => setUpdatedInvoice(e.target.value)}
                                                                                            className="border rounded p-1"
                                                                                            onBlur={() => handleSaveField(invoice.id, 'invoice')}
                                                                                            onKeyDown={(e) => handleKeyDown(e, invoice.id, 'invoice')}
                                                                                        />
                                                                                    ) : (
                                                                                        <span onClick={() => handleEditField(invoice.id, 'invoice', invoice.invoiceAmount)}>
                                                                                            {invoice.invoiceAmount || "-"}
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="py-2">
                                                                                    <DeleteIcon
                                                                                        className="cursor-pointer"
                                                                                        sx={{
                                                                                            fontSize: 24,
                                                                                            color: "red",
                                                                                            backgroundColor: "#fff",
                                                                                            borderRadius: "50%",
                                                                                            padding: "4px",
                                                                                            "&:hover": { backgroundColor: "#f5f5f5", color: "#ff0000" },
                                                                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                                                        }}
                                                                                        onClick={() => handleDelete(invoice.id)}
                                                                                    />
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>


                                                            ) : null}
                                                            <div className="flex mt-5 w-full justify-around">
                                                                <div className="flex">
                                                                    <div className="mb-3 font-bold text-gray-500 text-base text-nowrap">
                                                                        Add Delivery Note
                                                                    </div>
                                                                    <AddIcon
                                                                        onClick={handleInvoiceModal} AddIcon
                                                                        className="ml-4 cursor-pointer"
                                                                        sx={{
                                                                            fontSize: 30,
                                                                            color: "#ffffff",
                                                                            backgroundColor: "#3f82f7",
                                                                            borderRadius: "20%",
                                                                            padding: "2px",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {isInvoiceModelOpen && (
                                                        <InvoiceModal
                                                            isOpen={isInvoiceModelOpen}
                                                            handleClose={() => setIsInvoiceModalOpen(false)}
                                                            poId={poId}
                                                        />
                                                    )}
                                                    <Modal
                                                        show={showModal}
                                                        onClose={() => setShowModal(false)}
                                                        popup
                                                        size="md"
                                                    >
                                                        <Modal.Header />
                                                        <Modal.Body>
                                                            <div className="text-center">
                                                                <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-300 mb-4 mx-auto" />
                                                                <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                                                                    Are you sure you want to delete the Invoice?
                                                                </h3>
                                                                <div className="flex justify-center gap-4">
                                                                    <Button color="failure" onClick={handleDeleteInvoice}>
                                                                        Yes, I'm sure
                                                                    </Button>
                                                                    <Button color="gray" onClick={() => setShowModal(false)}>
                                                                        No, cancel
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Modal.Body>
                                                    </Modal>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                <div className="mt-8 mx-4">
                    <h2 className="text-2xl font-bold text-blue-900 mb-4">Mission Teams</h2>
                    {teamsData && teamsData.length > 0 ? (
                        <>
                            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg mb-2">
                                <thead className="bg-blue-100">
                                    <tr className="text-center border-b">
                                        <th className="py-3 px-4 border-b font-bold text-blue-700">Name</th>
                                        <th className="py-3 px-4 border-b font-bold text-blue-700">Email</th>
                                        <th className="py-3 px-4 border-b font-bold text-blue-700">Occupancy</th>
                                        {/* <th className="py-3 px-4 border-b font-bold text-blue-700">Edit</th> */}
                                        <th className="py-3 px-4 border-b font-bold text-blue-700">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamsData.map((value, index) => (
                                        <tr key={index} className="text-center border-b hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 border-b">
                                                {value?.username ? (
                                                    <a
                                                        href={`/users/profile/${value.userProfileId}`}
                                                        target="_blank"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {value.username}
                                                    </a>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>                                            <td className="py-3 px-4 border-b">{value?.email || "N/A"}</td>
                                            <td
                                                className="py-2"
                                                onDoubleClick={() =>
                                                    handleEditOccupancy(
                                                        value.UserTeams.team_id,
                                                        value.id,
                                                        value.UserTeams.occupancy
                                                    )
                                                }
                                            >
                                                {editingUserId === value.id &&
                                                    editingTeamId === value.UserTeams.team_id ? (
                                                    <input
                                                        type="text"
                                                        value={editingOccupancy}
                                                        onChange={(e) => setEditingOccupancy(e.target.value)}
                                                        onBlur={handleSaveOccupancy}
                                                        onKeyDown={handleOccupancyKeyDown}
                                                        className="text-center border rounded-md p-1"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    `${value?.UserTeams?.occupancy}%` || "-"
                                                )}
                                            </td>
                                            {/* <td className="py-2">
                                                <button>
                                                    <BorderColorIcon
                                                        className="cursor-pointer"
                                                        sx={{
                                                            fontSize: 24,
                                                            color: "#3f82f7",
                                                            backgroundColor: "#ffffff",
                                                            borderRadius: "50%",
                                                            padding: "4px",
                                                            transition:
                                                                "background-color 0.3s ease, color 0.3s ease",
                                                            "&:hover": {
                                                                backgroundColor: "#e0e0e0",
                                                                color: "#1a5bb6",
                                                            },
                                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                            cursor: `${teamStatus ? "pointer" : "not-allowed"}`
                                                        }}
                                                        onClick={() =>
                                                            handleEditOccupancy(
                                                                value.UserTeams.team_id,
                                                                value.id,
                                                                value.UserTeams.occupancy
                                                            )
                                                        }
                                                    />
                                                </button>
                                            </td> */}
                                            <td className="py-2">
                                                <button >
                                                    <DeleteIcon
                                                        className="cursor-pointer"
                                                        sx={{
                                                            fontSize: 24,
                                                            color: "red",
                                                            backgroundColor: "#fff",
                                                            borderRadius: "50%",
                                                            padding: "4px",
                                                            transition:
                                                                "background-color 0.3s ease, color 0.3s ease",
                                                            "&:hover": {
                                                                backgroundColor: "#f5f5f5",
                                                                color: "#ff0000",
                                                            },
                                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                            cursor: `${teamStatus ? "pointer" : "not-allowed"}`
                                                        }}
                                                        onClick={() =>
                                                            handleDeleteUserTeam(value.UserTeams.team_id, value.id)
                                                        }
                                                    />
                                                </button>
                                            </td>
                                            <Modal
                                                show={showTeamModal}
                                                onClose={() => setShowTeamModal(false)}
                                                popup
                                                size="md"
                                            >
                                                <Modal.Header />
                                                <Modal.Body>
                                                    <div className="text-center">
                                                        <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-300 mb-4 mx-auto" />
                                                        <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                                                            Are you sure you want to delete the User?
                                                        </h3>
                                                        <div className="flex justify-center gap-4">
                                                            <Button color="failure" onClick={handleDeleteUser}>
                                                                Yes, I'm sure
                                                            </Button>
                                                            <Button color="gray" onClick={() => setShowTeamModal(false)}>
                                                                No, cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Modal.Body>
                                            </Modal>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex mt-5 w-full justify-around">
                                <div className="flex">
                                    <div className="mb-3 font-bold text-gray-500 text-base text-nowrap">
                                        Add Members
                                    </div>
                                    <button disabled={!teamStatus} className="mb-3">
                                        <AddIcon
                                            onClick={handleTeamMembers}
                                            className={`ml-4 cursor-pointer`}
                                            sx={{
                                                fontSize: 30,
                                                color: "#ffffff",
                                                backgroundColor: "#3f82f7",
                                                borderRadius: "20%",
                                                padding: "2px",
                                                cursor: `${teamStatus ? "pointer" : "not-allowed"}`
                                            }}
                                        />
                                    </button>
                                </div>
                            </div>
                        </>

                    ) : (
                        <>
                            {" "}
                            <div className="flex mt-8 w-full justify-around items-center">
                                <div className="flex">
                                    <div className="mb-6 font-bold text-gray-500 text-base text-nowrap">
                                        Create Team
                                    </div>
                                    <AddIcon
                                        onClick={handleTeamCreation}
                                        className="ml-4 cursor-pointer"
                                        sx={{
                                            fontSize: 30,
                                            color: "#ffffff",
                                            backgroundColor: "#3f82f7",
                                            borderRadius: "20%",
                                            padding: "2px",
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
            {
                teamModalOpen && (
                    <AddTeam
                        isOpen={teamModalOpen}
                        closeModal={() => setTeamModalOpen(false)}
                        missionId={missionId}
                    />
                )
            }

            {
                teamMemberModal && (
                    <AddUser
                        isOpen={teamMemberModal}
                        closeModal={() => setTeamMemberModal(false)}
                        teamId={teamId}
                        missionId={missionId}
                    />
                )
            }

            {
                isPoEditModalOpen && (
                    <PoUpdate
                        poId={poId}
                        isOpen={isPoEditModalOpen}
                        onClose={() => setIsPoEditModalOpen(false)}
                    />
                )
            }
            {
                isViewModalOpen && (
                    <ViewDocLinkModal
                        isOpen={isViewModalOpen}
                        handleClose={() => setIsViewModalOpen(false)}
                        missionId={missionId}
                    />
                )}
            {isUploadModalOpen && (
                <SharePointModal
                    isOpen={isUploadModalOpen}
                    handleClose={() => setIsUploadModalOpen(false)}
                    missionId={missionId}
                />
            )}

        </div >
    );
};


// Function to calculate the mission duration in months
const calculateMissionDuration = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return "Not Specified";
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return diffMonths;
};

export default MissionPage