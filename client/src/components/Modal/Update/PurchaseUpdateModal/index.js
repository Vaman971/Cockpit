import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const PoUpdate = ({ isOpen, onClose, poId, handleInvoiceDetails, handleBack, missionId, showSkipButton}) => {
  const [formData, setFormData] = useState({});
  const [data, setData] = useState({});
  const [status, setStatus] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/po/update/${poId}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data = res.data;

      if (data.success === false) {
        toast.error("Failed to update purchase order");
        return;
      } else {
        toast.success("Purchase order updated successfully");
        onClose();
        handleInvoiceDetails(poId);  
      }
    } catch (error) {
      toast.error("Failed to update purchase order");
    }
  };

  const handleSkip = (e) => {
    e.preventDefault();
    onClose();
    handleInvoiceDetails(poId);
  }
  const onBack = () => {
    handleBack();
  }
 
  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, poDescription: e.target.value });
  };

  const handleAmountChange = (e) => {
    setFormData({ ...formData, poAmount: e.target.value });
  };

  const handleNumberChange = (e) => {
    setFormData({ ...formData, poNumber: e.target.value });
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, poDate: e.target.value });
  };

  const handleEndDateChange = (e) =>{
    setFormData({...formData, poEndDate: e.target.value});
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setFormData({ ...formData, poStatus: e.target.value });
  };

  const handleCurrencyCodeChange = (e) => {
    setCurrencyCode(e.target.value);
    setFormData({ ...formData, currencyCode: e.target.value });
  };

  useEffect(() => {
    // Fetch PO data by ID and set initial form data
    api
      .get(`/po/getPo/${poId}`, { withCredentials: true })
      .then((response) => {
        const data = response.data;
        setData(data); // Assuming the API returns the entire PO object
        setFormData(data);
      })
      .catch((error) => {
        console.error("Error fetching PO data:", error);
      });
  }, [poId]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-60 animate-fadeIn">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-8 shadow-lg max-w-2xl w-full animate-scaleIn"
          >
            {missionId &&                                                                        
              <ArrowBackIcon                                                                      
                className="pr-1 pb-2"                                                          
                style={{                                                                       
                  fontSize: "35px",                                                            
                  color: "black",                                                                                                                           
                  cursor: "pointer",                                                           
                }}                                                                             
                onClick={onBack}                                                               
              />                                                                               
            }        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <h2 className="col-span-2 text-2xl font-semibold text-center text-gray-800 mb-4">
                Update Purchase Order
              </h2>
              <div>
                <label htmlFor="poDescription" className="text-sm font-medium text-gray-600">
                  PO Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="poDescription"
                  value={formData?.poDescription || ""}
                  onChange={handleDescriptionChange}
                  placeholder={data?.poDescription || "Enter description"}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
                  required 
                />
              </div>

              <div>
                <label htmlFor="poAmount" className="text-sm font-medium text-gray-600">
                  PO Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="poAmount"
                  value={formData?.poAmount || ""}
                  onChange={handleAmountChange}
                  placeholder={data?.poAmount || "Enter amount"}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
                  required 
                />
              </div>

              <div>
                <label htmlFor="poDate" className="text-sm font-medium text-gray-600">
                  PO Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="poDate"
                  value={formData?.poDate || data.poDate}
                  onChange={handleDateChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
                  required 
                />
              </div>

              <div>
                <label htmlFor="poEndDate" className="text-sm font-medium text-gray-600">
                  PO End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="poEndDate"
                  value={formData?.poEndDate || data.poEndDate}
                  onChange={handleEndDateChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
                  required  
                />
              </div>

              <div>
                <label htmlFor="poNumber" className="text-sm font-medium text-gray-600">
                  PO Number 
                </label>
                <input
                  type="text"
                  id="poNumber"
                  value={formData?.poNumber || ""}
                  onChange={handleNumberChange}
                  placeholder={data?.poNumber || "Enter PO number"}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"  
                />
              </div>
              <div>
                <label htmlFor="status" className="text-sm font-medium text-gray-600">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={status || data?.poStatus}
                  onChange={handleStatusChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
                  required 
                >
                  <option value={undefined}>Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="currencyCode"
                  className="block text-sm font-medium text-gray-600"
                >
                  Currency Code
                </label>
                <select
                  id="currencyCode"
                  value={currencyCode || data?.currencyCode}
                  onChange={handleCurrencyCodeChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Currency</option>
                  {currencyOptions.map((option, index) => (
                    <option key={`${option.value}-${index}`} value={option.value}>
                      {option.label} ({option.value})
                    </option> 
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 ease-in-out mr-2"
              >
                Submit
              </button>
              {showSkipButton &&(
              <button
                    type="submit"
                    onClick={handleSkip}
                    className="bg-gray-600 text-white py-2 px-4 rounded-md mr-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md">
                      Skip
                    </button>
             )}

              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default PoUpdate;
