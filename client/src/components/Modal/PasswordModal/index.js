import React, { useState } from "react";
import axios from "axios";
import {toast} from 'react-toastify'
import {useSelector} from "react-redux";
 
const PasswordModal = ({isOpen,onClose}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const { currentUser } = useSelector((state) => state.user);
  const apiUrl = process.env.REACT_APP_API_URL;
 
  const handleSubmit =  async(e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password must match.");
    } else {
      try {
      const res = await axios.put(`${apiUrl}/users/updatePassword/${currentUser.user.user_id}`,formData, {withCredentials:true});
      const data = res.data;
      console.log(data);
      if (data.success === false ) {
        setError(data.message);
      }
      else {
        toast.success('Password is Updated!');
        onClose();
      }
      }
      catch(error){
        setError(error.message);
      }
    }
  };
 
  const handleOldPassword = (e) => {
    setOldPassword(e.target.value);
     setFormData({...formData, password: e.target.value})
  }
 
  const handleNewPassword = (e) => {
    setNewPassword(e.target.value);
    setFormData({...formData, newPassword: e.target.value})
  }
 
  return (
    <>
    <div className="modal fixed inset-0 z-10 flex justify-center items-center bg-black bg-opacity-40">
      <div className="modal-content bg-white p-8 rounded-lg w-80">
        <span
          className="close absolute top-0 right-0 p-2 cursor-pointer"
          onClick={() => console.log("Close modal")}
        >
          &times;
        </span>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label htmlFor="password" className="block mb-2">Old Password</label>
            <input
              type="password"
              id="password"
              value={oldPassword}
              onChange={handleOldPassword}
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="newPassword" className="block mb-2">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={handleNewPassword}
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="confirmPassword" className="block mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className=" flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Submit
          </button>
          <button
            type="close"
            className="bg-white text-black py-2 px-4 rounded-md border-sm border-blue-800 border hover:bg-blue-600 hover:text-white hover:border-none focus:outline-black focus:bg-blue-600"
            onClick={onClose}
          >
            Cancel
          </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};
 
export default PasswordModal;