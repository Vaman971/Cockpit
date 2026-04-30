import React, { useEffect, useState } from "react";
import axios from "axios";
import countryCodes from "../../../assets/CountryCodes.json";
import { toast } from "react-toastify";

const ActionModal = ({ isOpen, onClose, opportunityId }) => {
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState([]);
  const [leadUser, setLeadUser] = useState("");
  const [supportingUser, setSupportingUser] = useState("");
  const [cluster, setCluster] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [oppData, setOppData] = useState({});
  const [oppRegion, setOppRegion] = useState("");
  const [oppSource, setOppSource] = useState('');
  const [latestDate, setLatestDate] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [updationDate, setUpdationDate] = useState("");
  const [creationDate, setCreationDate] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedConfidence, setSelectedConfidence] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;
  // console.log(formData);

  // const priorities = ["High", "Medium", "Low"];

  const countryOptions = countryCodes.map((country) => ({
    label: country.name,
    value: country.code,
  }));

  const Status = ["Prospection", "Advanced", "Proposal", "Won", "Lost", "Hold"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData.Priority);
    try {
      const res = await axios.put(
        `${apiUrl}/oppurtunities/update/${opportunityId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;
      // console.log(formData)
      if (data.success === false) {
        console.log(data.message);
        return;
      } else if (formData && formData.status === "Won" && data[1][0].status === "Won") {
        toast.success("Project created & Opportunity Updated!!");
        onClose();
      } else if (
        data[1][0].status === "Prospection" ||
        data[1][0].status === "Advanced" ||
        data[1][0].status === "Lost" ||
        data[1][0].status === "Hold" ||
        data[1][0].status === "Proposal"
      ) {
        toast.success("Opportunity Updated!!");
        onClose();
      } else {
        toast.success("Opportunity Updated!!");
        onClose();
      }
      // console.log(formData)
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/oppurtunities/getOpp/${opportunityId}`, { withCredentials: true })
      .then((response) => {
        // console.log(response.data);
        setOppData(response.data);
        setFormData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [opportunityId, apiUrl]);

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

  const formatOpportunityId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `OPP-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  const handleLeadChange = (e) => {
    setLeadUser(e.target.value);
    setFormData({ ...formData, ledBy: parseInt(e.target.value) });
  };

  const handlePriorityChange = (e) => {
    setSelectedPriority(e.target.value);
    setFormData({ ...formData, Priority: e.target.value });
  };

  const handleConfidenceChange = (e) => {
    setSelectedConfidence(e.target.value);
    setFormData({ ...formData, Confidence: e.target.value });
  };

  const handleSupportChange = (e) => {
    setSupportingUser(e.target.value);
    setFormData({ ...formData, supportedBy: parseInt(e.target.value) });
  };

  const handleClusterChange = (e) => {
    setCluster(e.target.value);
    setFormData({ ...formData, cluster: e.target.value })
  }
  const handleSourceChange = (e) => {
    setOppSource(e.target.value);
    setFormData({ ...formData, source: e.target.value })
  }

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    if (e.target.value === "Won") {
      const priorityValue = "NA";
      const confidenceValue = "NA";
      setFormData({
        ...formData,
        Priority: priorityValue,
        Confidence: confidenceValue,
        status: e.target.value,
      });
    } else {
      setFormData({
        ...formData,
        status: e.target.value,
        Priority: oppData.Priority,
        Confidence: oppData.Confidence,
      });
    }
  };

  const handleLatestDateChange = (e) => {
    setLatestDate(formatDate(e.target.value));
    setFormData({
      ...formData,
      LatestContactDate: e.target.value,
    });
  };

  const handleNextDateChange = (e) => {
    setNextDate(formatDate(e.target.value));
    setFormData({
      ...formData,
      NextContactDate: e.target.value,
    });
  };

  const handleUpdationDateChange = (e) => {
    setUpdationDate(e.target.value);
    setFormData({
      ...formData,
      updatedAt: e.target.value,
    });
  };

  const handleCreationDateChange = (e) => {
    setCreationDate(e.target.value); // Update the local state for creation date
    setFormData({
      ...formData,
      createdAt: e.target.value, // Update createdAt in formData
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? "" : "hidden"}`}  >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose} ></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-6xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <h1 className="text-center text-blue-800 text-xl font-bold mt-2">
              {`Update Opportunity (${formatOpportunityId(opportunityId)})`}
            </h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-col-2 md:grid-cols-6 px-5 py-3">
              <div className="mb-4">
                <label
                  htmlFor="opRegion"
                  className="block text-sm font-medium text-gray-600"
                >
                  Opp Region
                </label>
                <select
                  id="opRegion"
                  name="opRegion"
                  value={oppRegion || oppData.OpRegion}
                  onChange={(e) => (
                    setOppRegion(e.target.value),
                    setFormData({ ...formData, OpRegion: e.target.value })
                  )}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 overflow-y-scroll max-h-40 max-w-48"
                >
                  <option value="">Select Country</option>
                  {countryOptions.map((country, index) => (
                    <option key={index} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="opUnit"
                  className="block text-sm font-medium text-gray-700"
                >
                  OP Unit
                </label>
                <input
                  type="text"
                  id="opUnit"
                  name="opUnit"
                  value={formData.OpUnit || ""}
                  placeholder={oppData?.OpUnit || ""}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  onChange={(e) =>
                    setFormData({ ...formData, OpUnit: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="cluster"
                  className="block text-sm font-medium text-gray-700"
                >
                  OP Cluster
                </label>
                <select
                  id="cluster"
                  name="cluster"
                  value={cluster || oppData.cluster}
                  onChange={handleClusterChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 overflow-y-scroll max-h-40 max-w-48"
                >
                  <option value="Select Cluster">Select Cluster</option>
                  <option value="SNPS">SNPS</option>
                  <option value="MNT">MNT</option>
                  <option value="MEBM">MEBM</option>
                  <option value="RDI">RDI</option>
                  <option value="JSO">JSO</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="associatedWP"
                  className="block text-sm font-medium text-gray-700"
                >
                  Associated WP
                </label>
                <input
                  type="text"
                  id="associatedWP"
                  name="associatedWP"
                  value={formData.AssociatedWP || ""}
                  placeholder={oppData?.AssociatedWP || ""}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      AssociatedWP: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="customerContactPoint"
                  className="block text-sm font-medium text-gray-700"
                >
                  Customer Contact Point
                </label>
                <input
                  type="text"
                  id="customerContactPoint"
                  name="customerContactPoint"
                  value={formData.CustomerContactPoint || ""}
                  placeholder={oppData?.CustomerContactPoint || ""}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      CustomerContactPoint: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="ExpectedDealSize"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Expected Deal Size &euro;
                </label>
                <input
                  type="number"
                  id="ExpectedDealSize"
                  name="ExpectedDealSize"
                  value={formData.ExpectedDealSize || ""}
                  placeholder={oppData?.ExpectedDealSize || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ExpectedDealSize: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="NextContactDate"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Next Contact Date
                </label>
                <input
                  type="date"
                  id="NextContactDate"
                  name="NextContactDate"
                  value={nextDate || formatDate(oppData.NextContactDate)}
                  onChange={handleNextDateChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="LatestContactDate"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Latest Contact Date
                </label>
                <input
                  type="date"
                  id="LatestContactDate"
                  name="LatestContactDate"
                  value={latestDate || formatDate(oppData.LatestContactDate)}
                  onChange={handleLatestDateChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="UpdationDate"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Updation Date
                </label>
                <input
                  type="date"
                  id="UpdationDate"
                  name="UpdationDate"
                  value={updationDate || formatDate(oppData.updatedAt)}
                  onChange={handleUpdationDateChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="status"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={selectedStatus || oppData.status}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select priority</option>
                  {Status.map((status) => (
                    <option key={Status.indexOf(status)} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="customerContactPoint"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Led By
                </label>
                <select
                  id="customerContactPoint"
                  name="customerContactPoint"
                  value={leadUser || oppData.ledBy}
                  onChange={handleLeadChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                >

                  <option value="">Select a Lead</option>
                  {user &&
                    user.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.username}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="priorityLevel"
                  className="block text-sm font-medium text-gray-600"
                >
                  Priority
                </label>
                <select
                  id="priorityLevel"
                  name="priorityLevel"
                  value={selectedPriority || oppData.Priority}  // Use oppData.priorityLevel directly
                  onChange={handlePriorityChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="NA">NA</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="confidenceLevel"
                  className="block text-sm font-medium text-gray-600"
                >
                  Confidence
                </label>
                <select
                  id="confidenceLevel"
                  name="confidenceLevel"
                  value={selectedConfidence || oppData.Confidence}
                  onChange={handleConfidenceChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Confidence</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="NA">NA</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="customerContactPoint"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Supported By
                </label>
                <select
                  id="customerContactPoint"
                  name="customerContactPoint"
                  value={supportingUser || oppData.supportedBy}
                  onChange={handleSupportChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a Supporter</option>
                  {user &&
                    user.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.username}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="cluster"
                  className="block text-sm font-medium text-gray-700"
                >
                  Source
                </label>
                <select
                  id="source"
                  name="source"
                  value={oppSource || oppData?.source}
                  onChange={handleSourceChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 overflow-y-scroll max-h-40 max-w-48"
                >
                  <option value="">Select Source</option>
                  <option value="Sales">Sales</option>
                  <option value="New MC">New MC</option>
                  <option value="Old MC">Old MC</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Customer Contact">Customer Contact</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="siglum"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Siglum
                </label>
                <input
                  id="siglum"
                  type="text"
                  name="program"
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  value={formData.Siglum || ""}
                  placeholder={oppData?.Siglum || "-"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Siglum: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="program"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Program
                </label>
                <input
                  id="program"
                  type="text"
                  name="program"
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  value={formData.Program || ""}
                  placeholder={oppData?.Program || "-"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Program: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="CreationDate"
                  className="block text-sm font-medium text-gray-600"
                >
                  Creation Date
                </label>
                <input
                  type="date"
                  id="CreationDate"
                  name="CreationDate"
                  value={creationDate || formatDate(oppData.createdAt)}  // Use createdAt instead of updatedAt
                  onChange={handleCreationDateChange}  // Update function name to handleCreationDateChange
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mb-4 mx-9">
              <label
                htmlFor="OpDescription"
                className="block text-sm font-medium text-gray-700"
              >
                OP Description
              </label>
              <textarea
                id="OpDescription"
                name="OpDescription"
                value={formData.OpDescription || ""}
                placeholder={oppData?.OpDescription || ""}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    OpDescription: e.target.value,
                  })
                }
              />
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-4">
              <button
                type="submit"
                className=" inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm w-1/2"
              >
                Save
              </button>
              <button
                onClick={onClose}
                type="button"
                className="mt-3 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:text-sm w-1/2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;