import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Dropdown } from "flowbite-react";
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import OpportunityDetailModal from "./Opportunity_ProjectDetail";
import OpportunityProjectDetailModal from "./Opportunity_ProjectDetail";

const OverviewPage = () => {
    const { opportunityId } = useParams();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [opportunityData, setOpportunityData] = useState(null);
    const [oppDescription, setoppDescription] = useState({})
    const [projectsData, setProjectsData] = useState([]);
    const [expandedOpportunities, setExpandedOpportunities] = useState({});
    const [expandedProjects, setExpandedProjects] = useState({});
    const [opportunitiesList, setOpportunitiesList] = useState([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState(opportunityId);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
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

    console.log(oppDescription)
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
                // First, fetch the opportunity data to check its status
                const opportunityResponse = await axios.get(`${apiUrl}/oppurtunities/getOpp/${selectedOpportunity}`, { withCredentials: true });
                const opportunityData = opportunityResponse.data;

                // Check the opportunity's status
                const opportunityStatus = opportunityData?.status; // Adjust based on how the status is represented

                // If the status is "prospection" or "proposal", don't fetch projects
                if (opportunityStatus === "prospection" || opportunityStatus === "proposal") {
                    console.log("No projects will be fetched for opportunities under prospection or proposal.");
                    return; // Exit the function
                }

                // Proceed to fetch projects only if the status is not in prospection or proposal
                const projectResponse = await axios.get(`${apiUrl}/project/getProjOpp/${selectedOpportunity}`, { withCredentials: true });
                const data = projectResponse.data;
                console.log(data);

                if (projectResponse.status === 200) {
                    setProjectsData(data[0]);
                    setSelectedProject(data[0]?.id);
                    console.log(data[0]?.id);
                } else {
                    // Log the response data for any other status codes
                    console.log("Failed to fetch projects:", projectResponse.data);
                }
            } catch (error) {
                console.log("Failed to fetch data");
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


    const handleOpportunityChange = (event) => {
        setSelectedOpportunity(event.value);
        setoppDescription(event)
    };

    const handleProjectChange = (projectId) => {
        setSelectedProject(projectId);
        toggleProjectExpand(projectId);
        setIsExpanded((prev) => !prev);
    };

    return (
        <div>
       <OpportunityProjectDetailModal/>     
        </div>
    );
};

export default OverviewPage;
