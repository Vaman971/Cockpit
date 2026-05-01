import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../axios";

const MissUpdate = ({ isOpen, onClose, missionId, isNewMission }) => {
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState(null);
  const [projData, setProjData] = useState(null);
  const [missionData, setMissionData] = useState({});
  const [missionProj, setMissionProj] = useState(null);
  const [missionLead, setMissionLead] = useState(null);
  const [missionStartDate, setMissionStartDate] = useState("");
  const [missionEndDate, setMissionEndDate] = useState("");
  const [missionCardDescription, setMissionCardDescription] = useState("");
  const [airbusId, setAirbusId] = useState(null);
  const [missionStatus, setMissionStatus] = useState("");
  const [missionType, setMissionType] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState([]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    let missionUpdated = false;
    let res = null;
    let ans = null;
    if (formData) {
    try {
      res = await api.put(
        `/mission/update/${missionId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        missionUpdated = true;
      }
    } catch (error) {
      console.log(error.message);
    }
    }
    if (selectedCustomerId && selectedCustomerId.length > 0) {
    try {
      ans = await api.post(
        `/mission/assignCustomerToMission/${missionId}`,
         {customerIds: selectedCustomerId},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (ans.data.success) {
        missionUpdated = true;
      }
    } catch (error) {
      console.log(error.message);
    }
    }
    if (missionUpdated) {
      toast.success("Mission Updated!!");
    } else {
      toast.error("Cannot be updated!!");
      return;
    }
    onClose();
  };

  useEffect(() => {
    api
      .get(`/users/getusers`, { withCredentials: true })
      .then((response) => {
        const data = response.data;
        const filteredUsers = data.filter(user => user.user_type === "Admin" || user.user_type === "Leader");
        setUser(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  useEffect(() => {
    api
      .get(`/project/getProj`, { withCredentials: true })
      .then((response) => {
        // console.log(response.data);
        setProjData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  useEffect(() => {
    api
      .get(`/mission/getMission/${missionId}`, {
        withCredentials: true,
      })
      .then((response) => {
        // console.log(response.data);
        setMissionData(response.data);
        setFormData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [missionId]);

  useEffect(() => {
    api.get(`/customer/getAllCustomers`,
      {
        withCredentials: true

      })
      .then((res) =>
        setCustomers(res.data))
      .catch((err) => console.error("Error fetching customers:", err));
  }, []);

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

  const handleMissionLead = (e) => {
    setMissionLead(e.target.value);
    setFormData({ ...formData, missionCardLeader: e.target.value });
  };

  const handleProjectChange = (e) => {
    setMissionProj(e.target.value);
    setFormData({ ...formData, projMissionId: e.target.value });
  };

  const handleStartDateChange = (e) => {
    setMissionStartDate(formatDate(e.target.value));
    setFormData({ ...formData, missionStartDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    setMissionEndDate(formatDate(e.target.value));
    setFormData({ ...formData, missionEndDate: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setMissionCardDescription(e.target.value);
    setFormData({ ...formData, missionDescription: e.target.value });
  };

  const handleAirbusId = (e) => {
    setAirbusId(e.target.value);
    setFormData({ ...formData, airbusId: e.target.value });
  };

  const handleMissionStatus = (e) => {
    setMissionStatus(e.target.value);
    setFormData({ ...formData, status: e.target.value });
  };

  const handleSkip = (e) => {
    e.preventDefault();
    onClose();

  }

  const handleMissionType = (e) => {
    setMissionType(e.target.value);
    setFormData({ ...formData, missionType: e.target.value });
  };

  const formatMissionId = (id) => {
    if (id === "-") {
      return "-";
    }
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `MC-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };


  return (
    <>
      {" "}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50 overflow-auto" onClick={onClose}>
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full" onClick={((e) => e.stopPropagation())}>

            <form onSubmit={handleSubmit}>
              <div className="relative">
                <h2 id="mission-modal-title" className="text-xl font-bold mb-4">
                  Update Mission Card {`(${formatMissionId(missionId)})`}
                </h2>
                <div className="flex gap-4 w-full">
                  <div className="flex flex-col gap-2 w-1/2">
                    <label
                      htmlFor="missionCardLeader"
                      className="block  text-sm font-medium text-gray-600"
                    >
                      Mission Execution Lead <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="missionCardLeader"
                      label="Mission Execution Lead"
                      value={missionLead || missionData?.missionCardLeader}
                      onChange={handleMissionLead}
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
                      Project Assigned <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="projMissionId"
                      label="Project Assigned"
                      value={missionProj || missionData?.projMissionId}
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
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="missionStartDate"
                      value={missionStartDate || missionData.missionStartDate}
                      onChange={handleStartDateChange}
                      className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-1/2">
                    <label
                      htmlFor="missionEndDate"
                      className="block text-sm font-medium text-gray-600"
                    >
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="missionEndDate"
                      value={missionEndDate || missionData.missionEndDate}
                      onChange={handleEndDateChange}
                      className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <label
                  htmlFor="airbusId"
                  className="block text-sm font-medium text-gray-600"
                >
                  Airbus Mission Id
                </label>
                <input
                  type="text"
                  id="airbusId"
                  value={formData.airbusId || ""}
                  placeholder={airbusId || missionData?.airbusId || "Not Defined"}
                  onChange={handleAirbusId}
                  className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />

                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="missionStatus"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Mission Status
                  </label>
                  <select
                    id="missionStatus"
                    label="Mission Status"
                    value={missionStatus || missionData.status}
                    onChange={handleMissionStatus}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value={'Yet to Start'}>Yet to Start</option>
                    <option value={'In Progress'}>In Progress</option>
                    <option value={'Closed'}>Closed</option>
                  </select>
                </div>

                <label
                  htmlFor="missionCardTeam"
                  className="block text-sm font-medium text-gray-600"
                >
                  Mission Description
                </label>
                <input
                  type="text"
                  id="missionCardTeam"
                  value={formData.missionDescription || ""}
                  placeholder={missionCardDescription || (missionData?.missionDescription || '-')}
                  onChange={handleDescriptionChange}
                  className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />

                <label
                  htmlFor="customer_ids"
                  className="block text-sm font-medium text-gray-600"
                >
                  Customer Contact Points <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <select
                    id="customer_ids"
                    label="Customer Names"
                    value={""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (
                        selectedId &&
                        !selectedCustomerId.includes(selectedId)
                      ) {
                        // Persist selectedCustomerId to localStorage
                        const updated = [...selectedCustomerId, selectedId];
                        setSelectedCustomerId(updated);
                        localStorage.setItem('selectedCustomerId', JSON.stringify(updated));
                      }
                    }}
                    className="w-full rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>
                      {selectedCustomerId.length === 0
                        ? "Select Customer(s)"
                        : "Add another customer"}
                    </option>
                    {customers &&
                      customers
                        .filter(
                          (customer) =>
                            !selectedCustomerId.includes(String(customer.customer_id))
                        )
                        .map((customer) => (
                          <option
                            key={customer.customer_id}
                            value={customer.customer_id}
                          >
                            {customer.first_name} {customer.last_name}
                          </option>
                        ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCustomerId &&
                    selectedCustomerId.length > 0 &&
                    customers
                      .filter((c) =>
                        selectedCustomerId.includes(String(c.customer_id))
                      )
                      .map((customer) => (
                        <span
                          key={customer.customer_id}
                          className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {customer.first_name} {customer.last_name}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = selectedCustomerId.filter(
                                (id) => id !== String(customer.customer_id)
                              );
                              setSelectedCustomerId(updated);
                              localStorage.setItem('selectedCustomerId', JSON.stringify(updated));
                            }}
                            className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                            aria-label="Remove"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                </div>

                <label
                  htmlFor="missionCardType"
                  className="block text-sm font-medium text-gray-600 "
                >
                  Mission Type
                </label>
                <input
                  type="text"
                  id="missionCardType"
                  value={formData.missionType || ""}
                  className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-gray-500"
                  readOnly
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-md mr-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Submit
                  </button>
                  {isNewMission && (<button
                    type="submit"
                    onClick={handleSkip}
                    className="bg-gray-600 text-white py-2 px-4 rounded-md mr-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md">
                    Skip
                  </button>)}
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
      )}
    </>
  );
};

export default MissUpdate;