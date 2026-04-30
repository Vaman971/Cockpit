import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserPill from './userPill';
import Pill from './pill';

const AddUser = ({ isOpen, closeModal, teamId, missionId }) => {
  const [existingUsers, setExistingUsers] = useState([]);
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
        const resp = await axios.get(
          `${apiUrl}/teams/getTeam/${missionId}`,
          { withCredentials: true }
        );
        const teamData = resp.data;
        if (teamData.success === false) {
          console.log(teamData.message);
        } else {
          setExistingUsers(teamData.Profiles || []);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    getTeamData();
  }, [missionId]);

  const createTeamData = async () => {
    try {
      const users = selectedUsers.map(user => user.id);
      const res = await axios.put(
        `${apiUrl}/teams/addTeamMembers/${teamId}`,
        {
          userIds: users
        },
        { withCredentials: true }
      );
      if (res.status !== 200) {
        console.log(res.message);
      } else {
        toast.success('Team Created Successfully!!!');
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
    setSelectedUsers([...selectedUsers, user]);
    setSelectedUserSet(new Set([...selectedUserSet, user.id]));
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
    if (e.key === 'Backspace' && e.target.value === "" && selectedUsers.length > 0) {
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

  const handleBufferImage = (data) => {
    if (!data) return null;
    const bufferData = new Uint8Array(data);
    const blob = new Blob([bufferData], { type: 'image/png' });
    return URL.createObjectURL(blob);
  };

  const handleSubmit = () => {
    createTeamData();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
            <h2 className="text-2xl font-bold text-blue-800 flex justify-center">Add Members</h2>
            <div className="existing-users-container mt-4 flex flex-wrap gap-2">
              {existingUsers.map(user => (
                <UserPill
                  key={user.id}
                  image={user.profileImage?.data ? handleBufferImage(user.profileImage.data) : undefined}
                  text={`${user.username}`}
                />
              ))}
            </div>
            <div className='mt-10'>
              <div className="user-search-container relative">
                <div className="user-search-input flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-2">
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
                    value={searchTerm}
                    onChange={handleUserChange}
                    placeholder="Search For a User..."
                    className="border-none outline-none flex-grow"
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <ul className={`suggestions-list absolute bg-white border border-gray-300 rounded-md mt-1 w-full max-h-48 overflow-y-auto transition-transform duration-200 ${suggestions.length ? 'scale-y-100' : 'scale-y-0'}`}>
                  {suggestions && suggestions.map((suggestion, index) => (
                    !selectedUserSet.has(suggestion.id) && (
                      <li key={suggestion.id} onClick={() => handleSelectedUser(suggestion)} className={`p-2 flex items-center gap-2 cursor-pointer ${index === activeSuggestion ? 'bg-gray-200' : ''}`}>
                        <img src={`data:image/png;base64, ${suggestion.profileImage}`} className="w-8 h-8 rounded-full" alt={`${suggestion.username}`} />
                        <span>{suggestion.username}</span>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            </div>
            <div className='flex justify-end gap-4'>
              <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 mt-10 rounded focus:outline-none focus:shadow-outline text-base">
                Submit
              </button>
              <button onClick={closeModal} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 mt-10 rounded focus:outline-none focus:shadow-outline text-base">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddUser;
