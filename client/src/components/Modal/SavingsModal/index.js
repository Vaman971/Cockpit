import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import axios from "axios";

const SavingsModal = ({ isOpen, onClose,revenueId }) => {
  const [formData, setFormData] = useState({});
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      const res = await axios.post (
        `${apiUrl}/saving/createSavings/${revenueId}`,
         formData,
         {
            withCredentials: true,
         }
      );
      const data = res.data;
      if (data.sucess === false) {
        console.log(data.message);
        toast.error("Error adding savings!")
        return;
      } else {
        toast.success("Savings added sucessfully!!");
        onClose();
      }
    } catch(error) {
        toast.error("All fields are required!!")
    }
  };

  const handleSavingsDate = (e) => {
    setDate(e.target.value);
    setFormData({...formData, savingDate : e.target.value});
  };

  const handleSavedAmount = (e) => {
    setAmount(e.target.value);
    setFormData({...formData, savingAmount : e.target.value});
  };

  const handleSavedRemark = (e) => {
    setRemark(e.target.value);
    setFormData({...formData, remark: e.target.value});
  };

  return (
    <>
      {isOpen && (
        <>
          <div className={`overlay ${isOpen ? "active" : ""}`} onClick={onClose}></div>
          <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center w-full h-full">
            <div className="max-w-3xl mx-auto rounded-lg shadow-lg overflow-hidden bg-white">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-500 flex p-4 cursor-pointer">
                <ArrowBackIcon
                  className="pr-2 pb-2"
                  style={{
                    fontSize: "35px", 
                    color: "#ffffff",
                  }}
                  onClick={onClose}
                />
                <h2 className="text-xl font-bold text-white whitespace-nowrap mx-16">Add Savings</h2>
              </div>
              {/* Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      id="date"
                      className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                      value={date}
                      onChange={handleSavingsDate}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      id="amount"
                      className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                      placeholder={amount}
                      onChange={handleSavedAmount}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="remark" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                      id="remark"
                      className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                      placeholder={remark}
                      onChange={handleSavedRemark}
                    />
                  </div>
                  {/* Buttons */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SavingsModal;
