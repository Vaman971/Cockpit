import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Select from "react-select";

const PoCreateModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({});
    const [missionProj, setMissionProj] = useState(null);
    const [missionData, setMissionData] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${apiUrl}/po/create`,
                formData,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            const data = res.data;

            if (data.success === false) {
                console.log(data.message);
                return;
            } else {
                toast.success("PO Created!!");
                onClose();
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        axios
            .get(`${apiUrl}/mission/getAll`, { withCredentials: true })
            .then((response) => {
                setMissionData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    }, [apiUrl]);

    const handleMissionChange = (selectedOption) => {
        setMissionProj(selectedOption);
        setFormData({ ...formData, poMissionId: selectedOption.value });
    };

    const handleDescriptionChange = (e) => {
        setFormData({ ...formData, poDescription: e.target.value });
    };

    const handleStartDateChange = (e) => {
        setFormData({ ...formData, poDate: e.target.value });
    };

    const handleEndDateChange = (e) => {
        setFormData({ ...formData, poEndDate: e.target.value });
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            border: "2px solid gray",
            borderRadius: "0.375rem",
            padding: "0.25rem",
            boxShadow: state.isFocused
                ? "0 0 0 3px rgba(59, 130, 246, 0.3)"
                : "none",
            "&:hover": { borderColor: "#3B82F6" },
            backgroundColor: "transparent",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#111827",
            fontWeight: "600",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9CA3AF",
            fontWeight: "500",
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? "#3B82F6" : "#9CA3AF",
            "&:hover": { color: "#3B82F6" },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.375rem",
            boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#BFDBFE" : "#FFFFFF",
            color: "#1D4ED8",
            "&:hover": { backgroundColor: "#BFDBFE" },
        }),
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-lg shadow-lg p-6 w-96"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                Create Purchase Order
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="projMissionId"
                                        className="block text-sm font-medium text-gray-600 mb-1"
                                    >
                                        Mission Assigned <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        id="projMissionId"
                                        value={missionProj}
                                        onChange={handleMissionChange}
                                        options={
                                            missionData &&
                                            missionData.map((mission) => ({
                                                value: mission.id,
                                                label: mission.missionDescription + " "+ mission.airbusId,
                                            }))
                                        }
                                        styles={customStyles}
                                        placeholder="Select the Project"
                                        required  
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="poDescription"
                                        className="block text-sm font-medium text-gray-600 mb-1"
                                    >
                                        PO Description <span className="text-red-500">*</span> 
                                    </label>
                                    <input
                                        id="poDescription"
                                        type="text"
                                        onChange={handleDescriptionChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter PO Description"
                                        required 
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="poStartDate"
                                        className="block text-sm font-medium text-gray-600 mb-1"
                                    >
                                        PO Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="poStartDate"
                                        type="date"
                                        onChange={handleStartDateChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required 
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="poEndDate"
                                        className="block text-sm font-medium text-gray-600 mb-1"
                                    >
                                        PO End Date <span className="text-red-500">*</span> 
                                    </label>
                                    <input
                                        id="poEndDate"
                                        type="date"
                                        onChange={handleEndDateChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required  
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PoCreateModal;
