import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../axios";

const UserUpdate = ({ isOpen, onClose, userId }) => {
  const [formData, setFormData] = useState({});
  const [userData, setUserData] = useState({});
  const [userType, setUsertype] = useState("");
  const [rate, setRate] = useState(0);
  const [active, setActive] = useState(true);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(
        `/users/updateUser/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;

      if (res.status === 200) {
        toast.success("User Updated!!");
        onClose();
      } else {
        toast.error("User Update Failed because " + data.message);
        return;
      }
    } catch (error) {
      toast.error("User Update Failed: Incorrect Field value");
    }
  };

  useEffect(() => {
    api
      .get(`/users/getUserbyId/${userId}`, { withCredentials: true })
      .then((response) => {
        // console.log(response.data.active);
        setUserData(response.data);
        setActive(response.data.active);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [userId]);

  const handleChange = (e) => {
    if (e.target.id === "user_type") {
      setUsertype(e.target.value);
    }
    if (e.target.id === "active") {
      setActive(e.target.value);
    }
    if (e.target.id === "burden_rate") {
      setRate(e.target.value);
    }
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto bg-gray-400 bg-opacity-50">
          {/* <ToastContainer/> */}
          <form onSubmit={handleSubmit}>
            <div className="relative bg-white rounded-lg p-8 w-[32rem] flex flex-col gap-2">
              <h2 id="project-modal-title" className="text-xl font-bold mb-4">
                Update User Details
              </h2>

              <div className="flex w-full justify-between items-center">
                <div className="flex flex-col">
                  <label htmlFor="username" className="block">
                    Username
                  </label>
                  <input
                    id="username"
                    label="userName"
                    variant="outlined"
                    placeholder={userData?.username || "Enter Username"}
                    onChange={handleChange}
                    className="p-2 w-full border rounded-md"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="email" className="block">
                    User Email
                  </label>
                  <input
                    id="email"
                    label="email"
                    variant="outlined"
                    placeholder={userData?.email || "Enter email "}
                    onChange={handleChange}
                    className="p-2 w-full border rounded-md"
                  />
                </div>
              </div>

              <label htmlFor="burden_rate" className="block">
                Burden Rate
              </label>
              <input
                id="burden_rate"
                name="burden_rate"
                onChange={handleChange}
                placeholder={rate||userData.burden_rate}
                className="p-2 w-full border rounded-md"
              >
              </input>
              <label htmlFor="active" className="block">
                Status
              </label>
              <select
                id="active"
                name="status"
                required
                onChange={handleChange}
                value={String(active)}
                className="p-2 w-full border rounded-md"
              >
                <option value={undefined}>Select status</option>
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>

              <label htmlFor="user_type" className="block">
                User Type
              </label>
              <select
                id="user_type"
                name="userType"
                onChange={handleChange}
                value={userType || userData.user_type}
                className="p-2 w-full border rounded-md"
              >
                <option value={undefined}>Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Leader">Leader</option>
                <option value="Reader">Reader</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit
                </button>
                <button
                  type="submit"
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 hover:ring-gray focus:ring-offset-2"
                  onClick={onClose}
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

export default UserUpdate;
