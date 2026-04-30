import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
const CustomerUpdateModal = ({ isOpen, closeModal, customerId }) => {
  const [formData, setFormData] = useState({});
  const apiUrl = process.env.REACT_APP_API_URL;
  const [customerData, setCustomerData] = useState({});
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [site, setSite] = useState("");
  const [siglum, setSiglum] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
 
 const handleSubmit = async (e) => { 
    e.preventDefault();
    try {
      const res = await axios.put(
        `${apiUrl}/customer/updateCustomer/${customerId}`,
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
        toast.error('Could not update Customer!');
        return;
      } else {
        toast.success("Customer updated!");
        closeModal();
      }
    } catch (error) {
      console.log(error.message);
    }
  };
 

useEffect(() => {
    axios
      .get(`${apiUrl}/customer/getMissionByCustomerId/${customerId}`, {
        withCredentials: true,
      })
      .then((response) => {
        setCustomerData(response.data.customer);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, [apiUrl, customerId]);


  const handleCustomerFirstNameChange = (e) => {
    setCustomerFirstName(e.target.value);
    setFormData({ ...formData, first_name: e.target.value });
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    setFormData({ ...formData, last_name: e.target.value });
  };

  const handleSiteChange = (e) => {
    setSite(e.target.value);
    setFormData({ ...formData, site: e.target.value });
  };


  const handleSiglumChange = (e) => {
    setSiglum(e.target.value);
    setFormData({ ...formData, siglum: e.target.value });
  };


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFormData({ ...formData, email: e.target.value });
  };


  const handleContactChange = (e) => {
    setContact(e.target.value);
    setFormData({ ...formData, phone: e.target.value });
  };
 
  return (
   
     <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white w-[600px] h-auto max-h-[80vh] rounded-md shadow-lg p-6 overflow-y-auto">
            <h2 className="text-blue-800 font-bold text-2xl text-center mb-6">Update Customer</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="customerFirstName"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Customer First Name
                </label>
                <input
                  type="text"
                  id="customerFirstName"
                  name="customerFirstName"
                  value={customerFirstName || customerData?.first_name}
                  onChange={handleCustomerFirstNameChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="lastName"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={lastName || customerData?.last_name}
                  onChange={handleLastNameChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="site"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Site
                </label>
                <input
                  type="text"
                  id="site"
                  name="site"
                  value={site || customerData?.site}
                  onChange={handleSiteChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="siglum"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Siglum
                </label>
                <input
                  type="text"
                  id="siglum"
                  name="siglum"
                  value={siglum || customerData?.siglum}
                  onChange={handleSiglumChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email || customerData?.email}
                  onChange={handleEmailChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="contact"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Contact No.
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={contact || customerData?.phone}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800"
                />
              </div>
               <div className="flex flex-col gap-1">
                <label
                  htmlFor="missionLeader"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Point of Contact
                </label>
                <input
                  type="text"
                  id="missionLeader"
                  name="missionLeader"
                  value={formData.missionLeader}
                  onChange={(e) => setFormData({ ...formData, missionLeader: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800"
                />
              </div>
 
 
              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-800 text-base font-medium text-white hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
 
export default CustomerUpdateModal