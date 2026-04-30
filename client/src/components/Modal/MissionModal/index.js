import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Select from 'react-select';

const MissionModal = ({ isOpen, onClose, goToLastPageAndRow }) => {
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState(null);
  const [projData, setProjData] = useState(null);
  const [missionProj, setMissionProj] = useState(null);
  const [missionLead, setMissionLead] = useState(null);
  const [missionType, setMissionType] = useState(null);
  const [missionOrientation, setMissionOrientation] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiUrl}/mission/createMission`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;

      if (data.success === false) {
        console.log(data.message);
        return;
      } else {
        toast.success("Mission Created!!");
        onClose();
        goToLastPageAndRow(data.id);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/users/getusers`, { withCredentials: true })
      .then((response) => {
        const data = response.data;
        const filteredUsers = data.filter(user => user.user_type === "Admin" || user.user_type === "Leader");
        setUser(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [apiUrl]);

  useEffect(() => {
    axios
      .get(`${apiUrl}/project/getProj`, { withCredentials: true })
      .then((response) => {
        setProjData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [apiUrl]);

  const handleMissionLead = (selectedOption) => {
    setMissionLead(selectedOption);
    setFormData({ ...formData, missionCardLeader: selectedOption.value });
  };

  const handleProjectChange = (selectedOption) => {
    setMissionProj(selectedOption);
    setFormData({ ...formData, projMissionId: selectedOption.value });
  }

  // const handleMissionType = (selectedType) => {
  //   setMissionType(selectedType);
  //   setFormData({ ...formData, missionType: selectedType.value });
  // }

  const handleMissionOrientation = (selectedOrientation) => {
    setMissionOrientation(selectedOrientation);
    setFormData({ ...formData, missionOrientation: selectedOrientation.value });
  }

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

  return (
    <>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50 overflow-auto" onClick={onClose}>
            <div className="bg-white shadow-lg rounded-lg p-8 w-96" onClick={((e) => e.stopPropagation())}>
              <form onSubmit={handleSubmit}>
                <div className="relative flex flex-col gap-2">
                  <h2 id="mission-modal-title" className="text-xl font-bold mb-4">
                    Create Mission Card
                  </h2>
                  <label
                    htmlFor="missionCardLeader"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Mission Execution Lead: <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="missionCardLeader"
                    label="Mission Execution Lead"
                    required
                    value={missionLead}
                    onChange={handleMissionLead}
                    options={user && user.map(user => ({ value: user.user_id, label: user.username }))}
                    styles={customStyles}
                    placeholder="Select the Lead"
                  />

                  <label
                    htmlFor="projMissionId"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Project Assigned <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="projMissionId"
                    label="Project Assigned"
                    required
                    value={missionProj}
                    onChange={handleProjectChange}
                    options={projData && projData.map(project => ({ value: project.id, label: project.project_title }))}
                    styles={customStyles}
                    placeholder="Select the Project"
                  />
                  {/* <label
                    htmlFor="missionType"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    Mission Type
                  </label> */}
                  {/* <Select
                    id="missionType"
                    label="Mission Type"
                    value={missionType}
                    onChange={handleMissionType}
                    options={[
                      { value: 'Internal', label: 'Internal' },
                      { value: 'External', label: 'External' }
                    ]}
                    styles={customStyles}
                    placeholder="Select the Type"
                  /> */}
                  {/* <div>
                  <label
                    htmlFor="missionOrientation"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    Mission Orientation
                  </label>
                  <Select
                    id="missionOrientation"
                    label="Mission Orientation"
                    value={missionOrientation}
                    onChange={handleMissionOrientation}
                    options={[
                      { value: 'InSitu', label: 'InSitu' },
                      { value: 'ExSitu', label: 'ExSitu' }
                    ]}
                    styles={customStyles}
                    placeholder="Select the Orientation"
                  />
                </div> */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white py-2 px-4 rounded-md mr-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>

      )}
    </>
  );
};

export default MissionModal;
