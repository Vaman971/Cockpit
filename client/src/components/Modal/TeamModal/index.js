import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Pill from "./pill";

const AddTeam = ({ isOpen, closeModal, missionId }) => {
  const [teamData, setTeamData] = useState([]);
  const [formData, setFormData] = useState({ team_name: "", active: true });
  const [createTeam, setCreateTeam] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserSet, setSelectedUserSet] = useState(new Set());
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;
  const inputRef = useRef(null);

  useEffect(() => {
    const getProfileData = async () => {
      setActiveSuggestion(0);
      if (searchTerm.trim() === "") {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(
          `${apiUrl}/profile/getAll?username=${searchTerm}`,
          { withCredentials: true }
        );
        const profileData = res.data;
        if (profileData.success === false) {
          console.log(profileData.message);
        } else {
          setSuggestions(res.data.userProfiles);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    getProfileData();
  }, [searchTerm]);

  useEffect(() => {
    const getTeamData = async () => {
      try {
        const resp = await axios.get(`${apiUrl}/teams/getTeam/${missionId}`, {
          withCredentials: true,
        });
        const teamData = resp.data;
        console.log(teamData);
        if (teamData.success === false) {
          console.log(teamData.message);
        } else {
          setTeamData(teamData);
          setCreateTeam(teamData.Profiles.id);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    getTeamData();
  }, [missionId]);

  const createTeamData = async () => {
    try {
      const users = selectedUsers.map((user) => ({
        id: user.id,
        active: true,
      }));

      const res = await axios.post(
        `${apiUrl}/teams/createTeam/${missionId}`,
        {
          team_name: formData.team_name,
          active: formData.active,
          users: users,
        },
        { withCredentials: true }
      );
      const data = res.data;
      console.log(data);
      if (res.status !== 200) {
        console.log(res.message);
      } else {
        toast.success("Team Created Successfully!!!");
        closeModal();
      }
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  const handleUserChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectedUser = (user) => {
    if (!selectedUserSet.has(user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSelectedUserSet(new Set([...selectedUserSet, user.id]));
    }
    setSearchTerm("");
    inputRef.current.focus();
  };

  const handleRemoveUser = (user) => {
    const updatedUsers = selectedUsers.filter(
      (selectedUser) => selectedUser.id !== user.id
    );
    setSelectedUsers(updatedUsers);

    const updatedEmails = new Set(selectedUserSet);
    updatedEmails.delete(user.id);
    setSelectedUserSet(updatedEmails);
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Backspace" &&
      e.target.value === "" &&
      selectedUsers.length > 0
    ) {
      const lastUser = selectedUsers[selectedUsers.length - 1];
      handleRemoveUser(lastUser);
      setSuggestions([]);
    } else if (e.key === "ArrowDown" && suggestions?.length > 0) {
      e.preventDefault();
      setActiveSuggestion((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp" && suggestions?.length > 0) {
      e.preventDefault();
      setActiveSuggestion((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (
      e.key === "Enter" &&
      activeSuggestion >= 0 &&
      activeSuggestion < suggestions.length
    ) {
      handleSelectedUser(suggestions[activeSuggestion]);
    }
  };

  const handleSubmit = () => {
    createTeamData();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
            <h2 className="text-2xl font-bold text-blue-800 flex justify-center">
              Create Team
            </h2>
            <div className="mt-10">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="team_name"
                >
                  Team Name
                </label>
                <input
                  type="text"
                  name="team_name"
                  value={formData.team_name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter team name"
                />
              </div>
              <div className="user-search-container">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="team_member"
                >
                  Team Members
                </label>
                <div className="user-search-input flex items-center flex-wrap">
                  {selectedUsers.map((profileData) => (
                    <Pill
                      key={profileData.id}
                      image={`data:image/png;base64, ${profileData.profileImage}`}
                      text={`${profileData.username}`}
                      onClick={() => handleRemoveUser(profileData)}
                    />
                  ))}

                  <input
                    ref={inputRef}
                    type="text"
                    id="team_member"
                    value={searchTerm}
                    onChange={handleUserChange}
                    placeholder="Search For a User..."
                    className="border-none flex-1"
                    onKeyDown={handleKeyDown}
                  />
                </div>
                {suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map(
                      (suggestion, index) =>
                        !selectedUserSet.has(suggestion.id) && (
                          <li
                            key={suggestion.id}
                            onClick={() => handleSelectedUser(suggestion)}
                            className={
                              index === activeSuggestion ? "active" : ""
                            }
                          >
                            <img
                              src={`data:image/png;base64, ${suggestion.profileImage}`}
                              className="listimg"
                              alt={suggestion.username}
                            />
                            <span>{suggestion.username}</span>
                          </li>
                        )
                    )}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 mt-10 rounded focus:outline-none focus:shadow-outline text-base"
              >
                Submit
              </button>
              <button
                onClick={closeModal}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 mt-10 rounded focus:outline-none focus:shadow-outline text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddTeam;
