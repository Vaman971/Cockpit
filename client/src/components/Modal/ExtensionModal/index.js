import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../axios";
import Select from 'react-select';

const ExtensionModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState(null);
  const [projData, setProjData] = useState(null);
  const [missionExtention, setMissionExtention] = useState(null);
  const [projectLead, setProjectLead] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/extension/createExtension', formData);
      const data = res.data;

      if (data.success === false) {
        toast.error(data.message || 'Validation failed');
        return;
      } else {
        toast.success("Extension Created!!");
        onClose();
      }
    } catch (error) {
      // Global interceptor handles toasts for 422 and 500
    }
  };

  useEffect(() => {
    api.get("/users/getusers")
      .then((response) => {
        const filteredUsers = response.data.filter(user => user.user_type === "Admin" || user.user_type === "Leader");
        setUser(filteredUsers);
      })
      .catch((error) => {
        // handled by interceptor
      });
  }, []);

  useEffect(() => {
    api.get("/project/getProj")
      .then((response) => {
        setProjData(response.data);
      })
      .catch((error) => {
        // handled by interceptor
      });
  }, []);

  const handleProjectLead = (selectedOption) => {
    setProjectLead(selectedOption);
    setFormData({ ...formData, projectLeader: selectedOption.value });
  };

  const handleProjectChange = (selectedOption) => {
    setMissionExtention(selectedOption);
    setFormData({ ...formData, extentionProjectId: selectedOption.value });
  };

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
        caretColor: 'black',
        outline: 'none',
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
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto bg-gray-400 bg-opacity-50">
          <form onSubmit={handleSubmit}>
            <div className="relative bg-white rounded-lg p-8 w-96 flex gap-2 flex-col">
              <h2 id="mission-modal-title" className="text-xl font-bold mb-4">
                Create Extension
              </h2>
              <label
                htmlFor="projectLeader"
                className="block text-sm font-medium text-gray-600"
              >
                Project Lead:
              </label>
              <Select
                id="projectLeader"
                label="Mission Execution Lead"
                required
                value={projectLead}
                onChange={handleProjectLead}
                options={user && user.map(user => ({ value: user.user_id, label: user.username }))}
                styles={customStyles}
                placeholder="Select the Lead"
              />

              <label
                htmlFor="projMissionId"
                className="block text-sm font-medium text-gray-600"
              >
                Project Assigned
              </label>
              <Select
                id="projMissionId"
                label="Project Assigned"
                required
                value={missionExtention}
                onChange={handleProjectChange}
                options={projData && projData.map(project => ({ value: project.id, label: project.project_title }))}
                styles={customStyles}
                placeholder="Select the Project"
              />

              <div className="flex justify-end mt-4">
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
      )}
    </>
  );
};

export default ExtensionModal;
