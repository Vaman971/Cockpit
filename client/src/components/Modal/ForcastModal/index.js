import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const ForcastUpdate = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({});
  const [forecastDate, setForecastDate] = useState("");
  const [country, setCountry] = useState("");
  const [cluster, setCluster] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiUrl}/forecast/create`,
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
        toast.error("Can not Validate");
        return;
      } else {
        toast.success("Forecast Created!!");
        onClose();
      }
    } catch (error) {
      toast.error("Invalid Arguments");
    }
  };


  const formatDate = (dateString) => {
    if (dateString === null) {
      return "-";
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleForecastDescription = (e) => {
    setFormData({ ...formData, forcastDescription: e.target.value });
  };

  const handleDeliveryForecast = (e) => {
    setFormData({ ...formData, deliveryForcast: e.target.value });
  };

  const handleForecastDateChange = (e) => {
    setForecastDate(formatDate(e.target.value));
    setFormData({ ...formData, forcastDate: e.target.value });
  };

  const handleSalesForecastChange = (e) => {
    setFormData({ ...formData, salesForcast: e.target.value });
  };

  const handleDpChange = (e) => {
    setFormData({ ...formData, dpValue: e.target.value });
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    setFormData({ ...formData, region: e.target.value });
  };

  const handleClusterChange = (e) => {
    setCluster(e.target.value);
    setFormData({ ...formData, cluster: e.target.value });
  };

  const handlePlannedForecastChange = (e) =>{
    setFormData({...formData, revenueForcast: e.target.value})
  }


  return (
    <>
      {" "}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto bg-gray-400 bg-opacity-50">
          <form onSubmit={handleSubmit}>
            <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full flex gap-2 flex-col">
              <h2 id="mission-modal-title" className="text-xl font-bold mb-4">
                Create Forecast
              </h2>
              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="missionCardLeader"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Country
                  </label>
                  <select
                    id="countryValue"
                    label="Country"
                    onChange={handleCountryChange}
                    value={country}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value={undefined}>select the country</option>
                    <option value={"IN"}>India</option>
                    <option value={"FR"}>France</option>
                    <option value={"UK"}>United Kingdom</option>
                    <option value={"DE"}>Germany</option>
                    <option value={"ES"}>Spain</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="projMissionId"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Cluster
                  </label>
                  <select
                    id="cluster"
                    label="Cluster Assigned"
                    value={cluster}
                    onChange={handleClusterChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value={undefined}>select the Cluster</option>
                    <option value={"SNPS"}>SNPS</option>
                    <option value={"MNT"}>MNT</option>
                    <option value={"MEBM"}>MEBM</option>
                    <option value={"RDI"}>RDI</option>
                    <option value={"JSO"}>JSO</option>
                    <option value={"Other"}>Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="missionStartDate"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Forecast Date
                  </label>
                  <input
                    type="date"
                    id="forcastDate"
                    value={forecastDate}
                    onChange={handleForecastDateChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2 w-1/2">
                  <label
                    htmlFor="DpValue"
                    className="block text-sm font-medium text-gray-600"
                  >
                    DP Value
                  </label>
                  <input
                    type="text"
                    id="DpValue"
                    placeholder={'Enter DP Value'}
                    onChange={handleDpChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <label
                htmlFor="forcastDescription"
                className="block text-sm font-medium text-gray-600"
              >
                Forecast Description
              </label>
              <input
                type="text"
                id="forcastDescription"
                placeholder={'Enter Forecast Description'}
                onChange={handleForecastDescription}
                className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
              />

              <div className="flex flex-col gap-2 w-full">
                <label
                  htmlFor="deliveryForcast"
                  className="block  text-sm font-medium text-gray-600"
                >
                  Delivery Forecast
                </label>
                <input
                type="number"
                id="forcastDelivery"
                placeholder={'Enter Delivery Forecast'}
                onChange={handleDeliveryForecast}
                step="0.01"
                className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              </div>

              <label
                htmlFor="salesForecast"
                className="block text-sm font-medium text-gray-600"
              >
                Sales Forecast
              </label>
              <input
                type="number"
                id="salesForecast"
                placeholder={'Enter Sales Forecast'}
                onChange={handleSalesForecastChange}
                step="0.01"
                className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
              />

              <label
                htmlFor="plannedForecast"
                className="block text-sm font-medium text-gray-600"
              >
                Planned Revenue (IPMS)
              </label>
              <input
                type="number"
                id="plannedForecast"
                placeholder={'Enter Planned Revenue'}
                onChange={handlePlannedForecastChange}
                step="0.01"
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

export default ForcastUpdate;
