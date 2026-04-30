import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Modal } from "flowbite-react";
import { toast } from "react-toastify";
import AddTeam from "../../../components/Modal/TeamModal";
import AddUser from "../../../components/Modal/TeamModal/members";
import UserDetails from "../../../components/Modal/UserDetailModal";
import CloseIcon from '@mui/icons-material/Close'; 
import { useNavigate } from "react-router-dom"; 

const MissionTeam = ({ isOpen, onClose, missionId, toggleActionModal }) => {
  const [data, setData] = useState(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamMemberModal, setTeamMemberModal] = useState(false);
  const [teamStatus, setTeamStatus] = useState(true);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [teamIdToDelete, setTeamIdToDelete] = useState("");
  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingOccupancy, setEditingOccupancy] = useState("");
  const [profileId, setProfileId] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [originalOccupancy, setOriginalOccupancy] = useState("");
  const [poId, setPoId] = useState(0);                          
  const navigate = useNavigate();                               

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchData();
  }, [apiUrl, showModal, teamModalOpen, teamMemberModal]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/teams/getTeam/${missionId}`, {
        withCredentials: true,
      });
      const missionRes = await axios.get(`${apiUrl}/mission/getMission/${missionId}`, {                
        withCredentials: true,                                                                      
      });  
      const data = res.data;
      const missionData = missionRes.data; 
      if (data.success === false) {
        console.log(data.message);
      } else {
        setTeamName(data.team_name);
        setTeamId(data.id);
        setData(data.Profiles);
        setTeamStatus(data.active);
      }
      if (missionData.success === false) {                                                         
        console.log(missionData.message);                                                           
      } else {                                                                                      
        setPoId(missionData?.projectPo[0].id);                                                     
        console.log(missionData?.projectPo[0].id);                                                  
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  

  const handleDeleteUser = async () => {
    try {
      const res = await axios.delete(
        `${apiUrl}/teams/deleteTeamMembers/${teamIdToDelete}/${userIdToDelete}`,
        { withCredentials: true }
      );
      const data = res.data;
      if (data.success === false) {
        toast.error(`Failed to delete the User.`);
      } else {
        toast.success("User Deleted Successfully");
        setShowModal(false);
      }
    } catch (error) {
      toast.error(`Failed to delete the User.`);
    }
  };

  const handleSaveOccupancy = async () => {
    // If occupancy hasn't changed, exit without API call
    if (editingOccupancy === originalOccupancy) {
      setEditingUserId(null);
      setEditingTeamId(null);
      return;
    }
  
    // Proceed with the API call if there's a change
    try {
      const res = await axios.put(
        `${apiUrl}/teams/updateUserTeams/${editingTeamId}/${editingUserId}`,
        { occupancy: editingOccupancy },
        { withCredentials: true }
      );
      if (res.data.success === false) {
        toast.error(`Failed to update occupancy.`);
      } else {
        toast.success("Occupancy Updated Successfully");
        setEditingUserId(null);
        setEditingTeamId(null);
        fetchData(); // Refresh the data after update
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error updating occupancy");
    }
  };
  

  const handleSaveTeamName = async () => {
    try {
      const res = await axios.put(
        `${apiUrl}/teams/updateTeam/${teamId}`,
        { team_name: newTeamName },
        { withCredentials: true }
      );
      if (res.data.success === false) {
        toast.error(`Failed to update the team name.`);
      } else {
        toast.success("Team Name Updated Successfully");
        setTeamName(newTeamName);
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(`Failed to update the team name.`);
    }
  };

  const handleTeamCreation = () => {
    setTeamModalOpen(true);
  };

  const handleTeamMembers = () => {
    setTeamMemberModal(true);
  };

  const handleDelete = (teamId, userId) => {
    setShowModal(true);
    setUserIdToDelete(userId);
    setTeamIdToDelete(teamId);
  };

  const handleSkip = () => {                                                       
    console.log(`${poId} po`);
    navigate(`/purchaseOrder/${poId}`,{                                            
      state: {missionId: missionId}                                             
    });
  }
 
  const handleBack = (e) => {
    e.preventDefault();
    onClose();
    toggleActionModal(missionId);                                                 
  }

  const handleUserProfileId = (id) => {
    setProfileId(id);
    setDetailsModalOpen(true);
  }

  const handleEditTeamName = () => {
    setIsEditing(true);
    setNewTeamName(teamName);
  };

  const handleEditOccupancy = (teamId, userId, currentOccupancy) => {
    setEditingUserId(userId);
    setEditingTeamId(teamId);
    setEditingOccupancy(currentOccupancy);
    setOriginalOccupancy(currentOccupancy);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveTeamName();
    }
  };

  const handleOccupancyKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveOccupancy();
    }
  };


  return (
    <>
      {isOpen && (
        <>
          <div
            className={`overlay ${isOpen ? "active" : ""}`}
            onClick={onClose}
          ></div>
          <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center w-full h-full">
            <div className="max-w-6xl mx-auto rounded-lg shadow-lg overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-blue-800 to-blue-500 flex p-4 justify-between items-center">
                <ArrowBackIcon
                  className="pr-1 pb-2"
                  style={{
                    fontSize: "35px",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                  onClick={handleBack}
                />
                {isEditing ? (
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onBlur={handleSaveTeamName}
                    onKeyDown={handleKeyDown}
                    className="text-md font-bold text-white bg-transparent border-b-2 border-white outline-none mx-16"
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-xl font-bold text-white whitespace-nowrap mx-16 cursor-pointer"
                    onDoubleClick={handleEditTeamName}
                  >
                    {teamName || "Team"}
                  </h2>
                )}
                <CloseIcon
                  className="pl-1 pb-2"
                  style={{
                    fontSize: "35px",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                  onClick={onClose}
                /> 
               
              </div>
              {data ? (
                <div className="bg-white my-10 mx-5 text-center">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2">Sr. No</th>
                        <th className="py-2">Name</th>
                        <th className="py-2">Email</th>
                        <th className="py-2">Progress</th>
                        <th className="py-2">Occupancy</th>
                        <th className="py-2">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((value) => (
                        <tr key={value.id} className="text-center">
                          <td className="py-2">{data.indexOf(value) + 1 || "-"}</td>
                          <td
                            className="py-2 cursor-pointer hover:underline"
                            onClick={() => handleUserProfileId(value.userProfileId)}
                          >
                            {value.username || "-"}
                          </td>
                          <td className="py-2">{value.email}</td>
                          <td className="py-2">
                            <div className="relative h-1.5 w-40 rounded-bl-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full bg-blue-500"
                                style={{ width: `${value.UserTeams.occupancy}%` }}
                              ></div>
                            </div>
                          </td>
                          <td
                            className="py-2 "
                            onDoubleClick={() =>
                              handleEditOccupancy(
                                value.UserTeams.team_id,
                                value.id,
                                value.UserTeams.occupancy
                              )
                            }
                          >
                            {teamStatus && editingUserId === value.id && editingTeamId === value.UserTeams.team_id ? (
                              <input
                                type="text"
                                value={editingOccupancy}
                                onChange={(e) => setEditingOccupancy(e.target.value)}
                                onBlur={handleSaveOccupancy}
                                onKeyDown={handleOccupancyKeyDown}
                                className="text-center border rounded-md p-1 "
                                autoFocus
                              />
                            ) : (
                              <p className="hover:text-blue-600 hover:cursor-pointer">
                              {`${value.UserTeams.occupancy}%` || "-"}
                              </p> 
                            )}
                          </td>
                          <td className="py-2">
                            <button disabled={!teamStatus}>
                              <DeleteIcon
                                className="cursor-pointer"
                                sx={{
                                  fontSize: 24,
                                  color: "red",
                                  backgroundColor: "#fff",
                                  borderRadius: "50%",
                                  padding: "4px",
                                  transition: "background-color 0.3s ease, color 0.3s ease",
                                  "&:hover": {
                                    backgroundColor: "#f5f5f5",
                                    color: "#ff0000",
                                  },
                                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  cursor: `${teamStatus ? "pointer" : "not-allowed"}`,
                                }}
                                onClick={() => handleDelete(value.UserTeams.team_id, value.id)}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>

                  <div className="flex mt-5 w-full justify-around">
                    <div className="flex gap-10">
                      <div>
                      <div className="mb-3 font-bold text-gray-500 text-base text-nowrap">
                        Add Members
                      </div>
                      <button disabled={!teamStatus} className="mb-3">
                        <AddIcon
                          onClick={handleTeamMembers}
                          className={`ml-4 cursor-pointer`}
                          sx={{
                            fontSize: 30,
                            color: "#ffffff",
                            backgroundColor: "#3f82f7",
                            borderRadius: "20%",
                            padding: "2px",
                            cursor: `${teamStatus ? "pointer" : "not-allowed"}`
                          }}
                        />
                      </button>
                      </div>
                      <div>
                      <button
                        type="submit"
                        className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md"
                        onClick={handleSkip}
                      >
                        Skip / Continue
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {" "}
                  <div className="flex mt-8 w-full justify-around items-center">
                    <div className="flex">
                      <div className="mb-6 font-bold text-gray-500 text-base text-nowrap">
                        Create Team
                      </div>
                      <AddIcon
                        onClick={handleTeamCreation}
                        className="ml-4 cursor-pointer"
                        sx={{
                          fontSize: 30,
                          color: "#ffffff",
                          backgroundColor: "#3f82f7",
                          borderRadius: "20%",
                          padding: "2px",
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            {teamModalOpen && (
              <AddTeam
                isOpen={teamModalOpen}
                closeModal={() => setTeamModalOpen(false)}
                missionId={missionId}
              />
            )}

            {teamMemberModal && (
              <AddUser
                isOpen={teamMemberModal}
                closeModal={() => setTeamMemberModal(false)}
                teamId={teamId}
                missionId={missionId}
              />
            )}

            {detailsModalOpen && (
              <UserDetails
                isOpen={detailsModalOpen}
                closeModal={() => setDetailsModalOpen(false)}
                id={profileId}
              />
            )}

            <Modal
              show={showModal}
              onClose={() => setShowModal(false)}
              popup
              size="md"
            >

              <Modal.Header />
              <Modal.Body>
                <div className="text-center">
                  <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-300 mb-4 mx-auto" />
                  <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                    Are you sure you want to Remove the User?
                  </h3>
                  <div className="flex justify-center gap-4">
                    <Button color="failure" onClick={handleDeleteUser}>
                      Yes, I'm sure
                    </Button>
                    <Button color="gray" onClick={() => setShowModal(false)}>
                      No, cancel
                    </Button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </>
      )}
    </>
  );
};

export default MissionTeam;
