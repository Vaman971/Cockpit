import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useEffect } from "react";

const SavingsUpdate = ({ isOpen, onClose,savingsId }) => {
  const [formData, setFormData] = useState({});
  const [date, setDate] = useState("");
  const [data, setData] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      const res = await axios.put (
        `${apiUrl}/saving//updateSavings/${savingsId}`,
         formData,
         {
            headers: {
                "Content-Type": "application/json",
              },
            withCredentials: true,
         }
      );
      const data = res.data;
      if (data.sucess === false) {
        console.log(data.message);
        toast.error("Failed to update savings!")
        return;
      } else {
        toast.success("Savings updated sucessfully!!");
        onClose();
      }
    } catch(error) {
        toast.error("Savings update unsuccessfull!!")
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setFormData({...formData, savingDate : e.target.value});
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setFormData({...formData, savingAmount : e.target.value});
  };

  const handleRemarkChange = (e) => {
    setRemark(e.target.value);
    setFormData({...formData, remark: e.target.value});
  };


  useEffect(() => {
    axios
      .get(`${apiUrl}/saving/getSavings/${savingsId}`, {
        withCredentials: true,
      })
      .then((response) => {
        const data = response.data;
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching savings data:", error);
      });
  }, [savingsId]);


  return (
    <>
      {isOpen && (
        <>
          <div className={`overlay ${isOpen ? "active" : ""}`} onClick={onClose}></div>
          <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center w-full h-full">
            <div className="max-w-3xl mx-auto rounded-lg shadow-lg overflow-hidden bg-white">
              {/* Header */}
                <h2 className="text-xl font-bold text-black whitespace-nowrap mx-16">Update Savings</h2>
              {/* Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      id="date"
                      className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                      value={date || data.savingDate}
                      onChange={handleDateChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      id="amount"
                      className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                      placeholder={amount || data.savingAmount}
                      onChange={handleAmountChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="remark" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                      id="remark"
                      className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                      placeholder={remark || data.remark}
                      onChange={handleRemarkChange}
                    />
                  </div>
                  {/* Buttons */}
                  <div className="flex  gap-2 justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" >
                      Update
                    </button>
                    <button 
                    type="button"
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus-ring-offset-2"
                    onClick={onClose}>
                      Cancel
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

export default SavingsUpdate;
