import api from "../../../axios";
import { Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useEffect, useState } from "react";

const UserDetails = ({ id, isOpen, closeModal }) => {
  
  const [data, setData] = useState({});
  const [profileImage, setProfileImage] = useState(null);

  // Convert buffer to base64
  const bufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return window.btoa(binary);
  };

  useEffect(() => {
    if (data && data.profileImage && data.profileImage.data) {
      const base64String = bufferToBase64(data.profileImage.data);
      setProfileImage(`data:image/jpeg;base64,${base64String}`);
    }
  }, [data]);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const res = await api.get(
          `/profile/getSingleProfileDetails/${id}`,
          { withCredentials: true }
        );
        const profileData = res.data;
        if (profileData.success === false) {
          console.log(profileData.message);
        } else {
          setData(profileData);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    getProfileData();
  }, [id]);

  return (
    <>
      <Modal
        show={isOpen}
        size="md"
        onClose={closeModal}
        popup
        className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            {/* Profile Image */}
            <div className="mb-4 flex justify-center">
              <img
                src={profileImage ? profileImage : './UserProfile.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full shadow-md"
              />
            </div>

            {/* User Details */}
            <div className="mb-5 text-left">
              {/* Name and Contact */}
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:underline"
                onClick={() => window.open(`/users/profile/${id}`)}>
                {data.username || 'N/A'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Contact: {data.contactDetails || 'N/A'}
              </p>

              {/* Total Occupancy */}
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Total Occupancy:</span> {data.totalOccupancy + "%" || 'N/A'}
              </p>

              {/* Missions */}
              <div className="mt-3">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Missions:</h4>
                {data.missions && data.missions.length > 0 ? (
                  <ul className="list-disc list-inside overflow-auto h-fit">
                    {data.missions
                      .filter((mission) => mission.active)
                      .map((mission, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400 badge badge-outline-primary cursor-auto">
                          Mission ID: {mission.missionId} - Occupancy: {mission.individualOccupancy + "%"}
                        </li>
                      ))
                    }
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No missions assigned.</p>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UserDetails;
