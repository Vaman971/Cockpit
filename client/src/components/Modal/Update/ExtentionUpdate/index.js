import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const ExtentionUpdate = ({ isOpen, onClose, extentionId }) => {
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState(null);
  const [projData, setProjData] = useState(null);
  const [extentionData, setExtentionData] = useState({});
  const [projExtention, setProjExtention] = useState(null);
  const [projectLead, setProjectLead] = useState(null);
  const [currencyCode, setCurrencyCode] = useState("");
  const [extentionStartDate, setExtentionStartDate] = useState("");
  const [extentionEndDate, setExtentionEndDate] = useState("");
  const [extentionDescription, setExtentionDescription] = useState("");
  const [likeliness, setLikeliness] = useState(null);
  const [extentionStatus, setExtentionStatus] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Country and currency code mapping
  const currencyOptions = [
    { label: "India", value: "INR" },
    { label: "Europe", value: "EUR" },
    { label: "USA", value: "USD" },
    { label: "UK", value: "GBP" },
    { label: "Germany", value: "EUR" }, // Same as Europe, skipped Germany
    { label: "Spain", value: "EUR" },   // Same as Europe, skipped Spain
    { label: "Romania", value: "RON" },
  ];

  const likelinessOptions = ["High","Medium","Low"];

console.log(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${apiUrl}/extention/updateExtention/${extentionId}`,
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
        toast.error('Can not Validate');
        return;
      } else {
        toast.success("Extention Updated!!");
        onClose();
      }
    } catch (error) {
      toast.error(error.response.data.error);
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
        // console.log(response.data);
        setProjData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [apiUrl]);

  useEffect(() => {
    axios
      .get(`${apiUrl}/extention/getExtention/${extentionId}`, {
        withCredentials: true,
      })
      .then((response) => {
        // console.log(response.data);
        setExtentionData(response.data);
        // setFormData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [apiUrl, extentionId]);

  const formatDate = (dateString) => {
    if (dateString === null) {
      return "yyyy-MM-dd";
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleProjectLead = (e) => {
    setProjectLead(e.target.value);
    setFormData({ ...formData, projectLeader: e.target.value });
  };

  const handleProjectChange = (e) => {
    setProjExtention(e.target.value);
    setFormData({ ...formData, extentionProjectId: e.target.value });
  };

  const handleStartDateChange = (e) => {
    setExtentionStartDate(formatDate(e.target.value));
    setFormData({ ...formData, extentionStartDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    setExtentionEndDate(formatDate(e.target.value));
    setFormData({ ...formData, extentionEndDate: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setExtentionDescription(e.target.value);
    setFormData({ ...formData, description: e.target.value });
  };

  const handleExtentionStatus = (e) => {
    setExtentionStatus(e.target.value);
    setFormData({ ...formData, status: e.target.value });
  };

  const handleLikelinessChange= (e)=> {
    setLikeliness(e.target.value);
    setFormData({...formData, likeliness: e.target.value });
  };

  const handleCurrencyCodeChange = (e) => {
    setCurrencyCode(e.target.value);
    setFormData({ ...formData, currencyCode: e.target.value });
  };


  return (
    <>
      {" "}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto bg-gray-400 bg-opacity-50">
          <form onSubmit={handleSubmit}>
            <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full flex gap-2 flex-col">
              <h2 id="mission-modal-title" className="text-xl font-bold mb-4">
                Update Extention
              </h2>
              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="missionCardLeader"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Project Lead
                  </label>
                  <select
                    id="missionCardLeader"
                    label="Mission Execution Lead"
                    value={projectLead || extentionData?.projectLeader}
                    onChange={handleProjectLead}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value={undefined}>select the Lead</option>
                    {user &&
                      user.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.username}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="projMissionId"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Project Assigned
                  </label>
                  <select
                    id="projMissionId"
                    label="Project Assigned"
                    value={projExtention || extentionData?.extentionProjectId}
                    onChange={handleProjectChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value={undefined}>select the Project</option>
                    {projData &&
                      projData.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.project_title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="missionStartDate"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="missionStartDate"
                    value={extentionStartDate || extentionData.extentionStartDate}
                    onChange={handleStartDateChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="missionEndDate"
                    className="block text-sm font-medium text-gray-600"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="missionEndDate"
                    value={extentionEndDate || extentionData.extentionEndDate}
                    onChange={handleEndDateChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="missionStatus"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Extention Status
                  </label>
                  <select
                    id="missionStatus"
                    label="Mission Status"
                    value={extentionStatus || extentionData.status}
                    onChange={handleExtentionStatus}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value={true}>Pending PO</option>
                    <option value={false}>PO Recieved</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="currencyCode"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Currency Code
                  </label>
                  <select
                    id="currencyCode"
                    value={currencyCode || extentionData?.currencyCode}
                    onChange={handleCurrencyCodeChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Currency</option>
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.value})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-1/2">
                <label
                  htmlFor="likeliness"
                  className="block text-sm font-medium text-gray-600"
                >
                  Likeliness
                </label>
                <select
                  id="likeliness"
                  value={likeliness || extentionData?.likeliness}
                  onChange={handleLikelinessChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value={undefined}>Select Likeliness</option>
                  {likelinessOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <label
                htmlFor="missionCardTeam"
                className="block text-sm font-medium text-gray-600"
              >
                Project Description
              </label>
              <input
                type="text"
                id="missionCardTeam"
                value={formData.description || ""}
                placeholder={extentionDescription || (extentionData?.description || '-')}
                onChange={handleDescriptionChange}
                className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
              />

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
      )}
    </>
  );
};

export default ExtentionUpdate;