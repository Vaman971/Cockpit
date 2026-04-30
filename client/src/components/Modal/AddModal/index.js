import React, { useState, useEffect } from "react";
import countryCodes from "../../../assets/CountryCodes.json";
import { toast } from "react-toastify"; // Import toast
import axios from "axios";

const AddModal = ({ isOpen, closeModal }) => {
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState([]);
  const [leadUser, setLeadUser] = useState("");
  const [supportingUser, setSupportingUser] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedConfidence, setSelectedConfidence] = useState("");
  const [selectedType, setSelectedType] = useState("External");
  const [cluster, setCluster] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  const countryOptions = countryCodes.map((country) => ({
    label: country.name,
    value: country.code,
  }));

  const priorities = ["High", "Medium", "Low"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiUrl}/oppurtunities/createOpp`,
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
        toast.success("Opportunity created!");
        closeModal();
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
        const filteredUsers = data.filter(
          (user) => user.user_type === "Admin" || user.user_type === "Leader"
        );
        setUser(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [apiUrl]);

  if (!isOpen) {
    return null;
  }

  const handleLeadChange = (e) => {
    setLeadUser(e.target.value);
    setFormData({ ...formData, ledBy: parseInt(e.target.value) });
  };

  const handleSupportChange = (e) => {
    setSupportingUser(e.target.value);
    setFormData({ ...formData, supportedBy: parseInt(e.target.value) });
  };

  const handlePriorityChange = (e) => {
    setSelectedPriority(e.target.value);
    setFormData({ ...formData, Priority: e.target.value });
  };

  const handleConfidenceChange = (e) => {
    setSelectedConfidence(e.target.value);
    setFormData({ ...formData, Confidence: e.target.value });
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setFormData({ ...formData, opportunityType: e.target.value });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full" onClick={((e)=> e.stopPropagation())}>
            <h2 className="text-xl rounded-lg font-bold mb-4 bg-gradient-to-r from-blue-800 to-blue-500 flex p-4 text-center text-white w-full">
              Create New Opportunity
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-col-2 md:grid-cols-4 overflow-auto">
                {/* Opp Region */}
                <div className="mb-4">
                  <label htmlFor="opRegion" className="block text-sm font-medium text-gray-600">
                    Opp Region
                  </label>
                  <select
                    id="opRegion"
                    name="opRegion"
                    onChange={(e) => setFormData({ ...formData, OpRegion: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Country</option>
                    {countryOptions.map((country, index) => (
                      <option key={index} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Opp Site */}
                <div className="mb-4">
                  <label htmlFor="opUnit" className="block text-sm font-medium text-gray-600">
                    Opp Site
                  </label>
                  <input
                    type="text"
                    id="opUnit"
                    name="opUnit"
                    onChange={(e) => setFormData({ ...formData, OpUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Opp Description */}
                <div className="mb-4">
                  <label htmlFor="opDescription" className="block text-sm font-medium text-gray-600">
                    Opp Description
                  </label>
                  <input
                    type="text"
                    id="opDescription"
                    name="opDescription"
                    onChange={(e) => setFormData({ ...formData, OpDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Associated WP */}
                <div className="mb-4">
                  <label htmlFor="AssociatedWP" className="block text-sm font-medium text-gray-600">
                    Associated WP
                  </label>
                  <input
                    type="text"
                    id="AssociatedWP"
                    name="AssociatedWP"
                    onChange={(e) => setFormData({ ...formData, AssociatedWP: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* First Contact Date */}
                <div className="mb-4">
                  <label htmlFor="FirstContactDate" className="block text-sm font-medium text-gray-600">
                    First Contact Date
                  </label>
                  <input
                    type="date"
                    id="FirstContactDate"
                    name="FirstContactDate"
                    onChange={(e) => setFormData({ ...formData, FirstContactDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Customer Contact Point */}
                <div className="mb-4">
                  <label htmlFor="customerContactPoint" className="block text-sm font-medium text-gray-600">
                    Customer Contact Point
                  </label>
                  <input
                    type="text"
                    id="customerContactPoint"
                    name="customerContactPoint"
                    onChange={(e) => setFormData({ ...formData, CustomerContactPoint: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Siglum */}
                <div className="mb-4">
                  <label htmlFor="Siglum" className="block text-sm font-medium text-gray-600">
                    Siglum
                  </label>
                  <input
                    type="text"
                    id="Siglum"
                    name="Siglum"
                    onChange={(e) => setFormData({ ...formData, Siglum: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Priority */}
                <div className="mb-4">
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-600">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={selectedPriority}
                    onChange={handlePriorityChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Priority</option>
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Confidence */}
                <div className="mb-4">
                  <label htmlFor="Confidence" className="block text-sm font-medium text-gray-600">
                    Confidence
                  </label>
                  <select
                    id="Confidence"
                    name="Confidence"
                    value={selectedConfidence}
                    onChange={handleConfidenceChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Confidence</option>
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Opp Source */}
                <div className="mb-4">
                <label
                  htmlFor="source"
                  className="block text-sm font-medium text-gray-600"
                >
                  Opp Source
                </label>
                <select
                  id="source"
                  name="source"
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select Source</option>
                  <option value="Sales">Sales</option>
                  <option value="New MC">New MC</option>
                  <option value="Old MC">Old MC</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Customer Contact">Customer Contact</option>
                </select>
                </div>

                {/* Opp Type */}
                <div className="mb-4">
                  <label htmlFor="opportunityType" className="block text-sm font-medium text-gray-600">
                    Opp Type
                  </label>
                  <select
                    id="opportunityType"
                    name="opportunityType"
                    value={selectedType}
                    onChange={handleTypeChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                  </select>
                </div>

                {/* Cluster */}
                <div className="mb-4">
                <label
                  htmlFor="cluster"
                  className="block text-sm font-medium text-gray-600"
                >
                  OP Cluster
                </label>
                <select
                  id="cluster"
                  name="cluster"
                  required
                  value={cluster}
                  onChange={(e) => {
                    setCluster(e.target.value);
                    setFormData({ ...formData, cluster: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="Select Cluster">Select Cluster</option>
                  <option value="SNPS">S&PS</option>
                  <option value="MNT">MNT</option>
                  <option value="MEBM">MEBM</option>
                  <option value="Other">Other</option>
                  <option value="RDI">RDI</option>
                  <option value="JSO">JSO</option>
                </select>
                </div>

                {/* Led By */}
                <div className="mb-4">
                  <label htmlFor="ledBy" className="block text-sm font-medium text-gray-600">
                    Led By
                  </label>
                  <select
                    id="ledBy"
                    name="ledBy"
                    value={leadUser}
                    onChange={handleLeadChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Lead User</option>
                    {user.map((user) => (
                      <option key={user.id} value={user.user_id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supported By */}
                <div className="mb-4">
                  <label htmlFor="supportedBy" className="block text-sm font-medium text-gray-600">
                    Supported By
                  </label>
                  <select
                    id="supportedBy"
                    name="supportedBy"
                    value={supportingUser}
                    onChange={handleSupportChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Supporting User</option>
                    {user.map((user) => (
                      <option key={user.id} value={user.user_id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div className="mb-4">
                  <label htmlFor="ExpectedDealSize" className="block text-sm font-medium text-gray-600">
                    Budget
                  </label>
                  <input
                    type="number"
                    id="ExpectedDealSize"
                    name="ExpectedDealSize"
                    onChange={(e) => setFormData({ ...formData, ExpectedDealSize: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Expected Close Date */}
                <div className="mb-4">
                  <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-600">
                    Creation Date
                  </label>
                  <input
                    type="date"
                    id="createdAt"
                    name="createdAt"
                    onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mr-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddModal;
