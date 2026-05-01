import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../axios";
import { ToggleSwitch } from "flowbite-react";

const ForcastUpdate = ({ isOpen, onClose, forcastId }) => {
  const [formData, setFormData] = useState({});
  const [forecastData, setForecastData] = useState({});
  const [forecastDate, setForecastDate] = useState("");
  const [status, setStatus] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("");
  const [dpValue, setDpValue] = useState("");
  const [country, setCountry] = useState("");
  const [cluster, setCluster] = useState("");
  

  const currencyOptions = [
    { label: "India", value: "INR" },
    { label: "Europe", value: "EUR" },
    { label: "USA", value: "USD" },
    { label: "UK", value: "GBP" },
    { label: "Germany", value: "EUR" }, // Same as Europe, skipped Germany
    { label: "Spain", value: "EUR" },   // Same as Europe, skipped Spain
    { label: "Romania", value: "RON" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(
        `/forecast/update/${forcastId}`,
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
        toast.success("Forecast Updated!!");
        onClose();
      }
    } catch (error) {
      toast.error("Invalid Arguments");
    }
  };

  useEffect(() => {
    api
      .get(`/forecast/getForecast/${forcastId}`, {
        withCredentials: true,
      })
      .then((response) => {
        // console.log(response.data);
        setForecastData(response.data);
        setStatus(response.data.status);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [forcastId]);

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
    setDpValue(e.target.value);
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

  const handleRemarkChange = (e) => {
    setFormData({ ...formData, remark: e.target.value });
  };

  const handlePlannedForecastChange = (e) => {
    setFormData({ ...formData, revenueForcast: e.target.value });
  };

  const handleCurrencyCodeChange = (e) => {
    setCurrencyCode(e.target.value);
    setFormData({ ...formData, currencyCode: e.target.value });
  };

  const formatForcastId = (id) => {
    if (id === "-") {
      return "-";
    }
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `FR-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  return (
    <>
      {" "}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto bg-gray-400 bg-opacity-50">
          <form onSubmit={handleSubmit}>
            <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full flex gap-2 flex-col">
              <div className="flex justify-between mb-5">
                <h2 id="mission-modal-title" className="text-lg font-bold">
                  Update Forecast {`(${formatForcastId(forcastId)})`}
                </h2>
                <ToggleSwitch
                  id="Status"
                  checked={status}
                  label="Status"
                  onChange={(checked) => {
                    setStatus(!status);
                    setFormData({ ...formData, status: checked });
                  }}
                  color="green"
                  sizing="lg"
                />
              </div>
              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="missionCardLeader"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Country
                  </label>
                  <select
                    id="countryValue"
                    label="Country"
                    value={country || forecastData.region}
                    onChange={handleCountryChange}
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

                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="projMissionId"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Cluster
                  </label>
                  <select
                    id="cluster"
                    label="Cluster Assigned"
                    value={cluster || forecastData.cluster}
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

                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="currencyCode"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Currency Code
                  </label>
                  <select
                    id="currencyCode"
                    value={currencyCode || forecastData?.currencyCode}
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
                    value={forecastDate || forecastData.forcastDate}
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
                    placeholder={dpValue || forecastData.dpValue}
                    onChange={handleDpChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="deliveryForcast"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Delivery Forecast
                  </label>
                  <input
                    type="text"
                    id="forcastDelivery"
                    placeholder={forecastData.deliveryForcast || "-"}
                    onChange={handleDeliveryForecast}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="salesForecast"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Sales Forecast
                  </label>
                  <input
                    type="text"
                    id="salesForecast"
                    placeholder={forecastData.salesForcast || "-"}
                    onChange={handleSalesForecastChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="plannedForecast"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Planned Revenue (IPMS)
                  </label>
                  <input
                    type="text"
                    id="plannedForecast"
                    placeholder={forecastData.revenueForcast || "-"}
                    onChange={handlePlannedForecastChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

              </div>
              <div className="flex flex-col gap-2 w-full">
                <label
                  htmlFor="forcastDescription"
                  className="block text-sm font-medium text-gray-600"
                >
                  Forcast Description
                </label>
                <input
                  type="text"
                  id="forcastDescription"
                  placeholder={forecastData.forcastDescription || "-"}
                  onChange={handleForecastDescription}
                  className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label
                  htmlFor="remark"
                  className="block text-sm font-medium text-gray-600"
                >
                  Remarks
                </label>
                <input
                  type="text"
                  id="remark"
                  placeholder={forecastData.remark || "-"}
                  onChange={handleRemarkChange}
                  className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>



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
