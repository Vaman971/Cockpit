import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Label, TextInput, Textarea, Dropdown } from "flowbite-react";
import api from "../../axios";
import { useSelector, useDispatch } from "react-redux";
import countryCodes from "../../assets/CountryCodes.json";
import {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from "../../redux/profile/profileSlice";
import PasswordModal from "../../components/Modal/PasswordModal";
import { signoutSuccess } from '../../redux/user/userSlice'
import { profileSignOut } from "../../redux/profile/profileSlice";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const filePickerRef = useRef();
  
  // const { currentProfile } = useSelector((state) => state.profile);
  const { currentUser } = useSelector((state) => state.user);
  const { currentProfile } = useSelector((state) => state.profile);
  const [profileImage, setProfileImage] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [formData, setFormData] = useState({});
  const [countryCode, setCountryCode] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [designation, setDesignation] = useState("")
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const locationOptions = ["India", "Romania", "Spain", "France", "Germany", "United Kingdom"];
  const designationOptions = [
    "Graduate Engineering Trainee",
    "Solution Developer",
    "Sr. Solution Developer",
    "SME Aerospace",
    "Technical Lead",
    "Sr. Technical Lead",
    "AVP-DES Delivery",
    "Project Manager",
    "Engagement Manager",
    "Sr. Engagement Manager",
    "VP-DES Delivery"
  ];

  const handleSignOut = async () => {
    try {
      const res = await api.post(`/users/signout`);
      const data = res.data;

      if (data.success === false) {
        console.log(data.message);
      }
      else {
        dispatch(signoutSuccess(data));
        dispatch(profileSignOut(data));
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(false);
  }

  const countryOptions = countryCodes.map((country) => ({
    label: country.name,
    countryCode: country.dial_code,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateProfileStart());
      const res = await api.put(
        `/profile/updateUserProfile/${currentUser.user.username}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      const data = res.data;
      if (data.success === false) {
        return dispatch(updateProfileFailure(data.message));
      } else {
        toast.success("Profile Updated succesfully");
        dispatch(updateProfileSuccess(data));
        navigate(`/users/profile/${currentUser.user.user_id}`)
      }
    } catch (error) {
      dispatch(updateProfileFailure(error.message));
    }
  };

  useEffect(() => {
    if (profileData && profileData.profileImage) {
      setProfileImage(`data:image/png;base64, ${profileData.profileImage}`);
    }
  }, [profileData]);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const res = await api.get(
          `/profile/getProfile/${currentUser.user.username}`,
          { withCredentials: true }
        );
        const profileData = res.data.userProfile;

        if (profileData.success === false) {
          console.log(profileData.message);
        } else {
          setProfileData(profileData);
          setFormData(profileData);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    getProfileData();
  }, [currentProfile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFileUrl(URL.createObjectURL(file));
      setFormData({ ...formData, profileImage: file });
    }
  };

  const handlechange = (e) => {
    if (e.target.id === 'contactDetails') {
      setPhoneNumber(e.target.value);
    }
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleCountryCodeChange = (code) => {
    setCountryCode(code);
    setFormData({ ...formData, contactCode: code });
  };

  const handleLocationChange = (location) => {
    setLocation(location);
    setFormData({ ...formData, location });
  };

  const handleDesignationChange = (designation) => {
    setDesignation(designation);
    setFormData({ ...formData, designation });
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    setFormData({ ...formData, firstName: e.target.value });
  }

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    setFormData({ ...formData, lastName: e.target.value });
  }

  const handleBioChange = (e) => {
    setBio(e.target.value);
    setFormData({ ...formData, bio: e.target.value });
  }

  return (
    <div className="flex justify-center h-screen">
      <form
        className="flex flex-col gap-4 max-w-2xl w-4/5"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="bg-white shadow-md rounded-md w-full p-8 flex flex-col justify-between flex-2">
            <div
              className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full border-8 border-[lightgray] flex justify-center items-center"
              onClick={() => filePickerRef.current.click()}
            >
              <label htmlFor="profileImage"></label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                ref={filePickerRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="mb-2 block">
                <img
                  src={(imageFileUrl ?? profileImage) || "./UserProfile.png"}
                  alt="user"
                  className={`rounded-full w-full h-full object-cover ${profileImage ? "opacity-100" : "opacity-60"
                    }`}
                />
              </div>
            </div>
            <div className="flex justify-around gap-4">
              <div className="mb-2 w-1/2">
                <Label htmlFor="firstName" value="First Name" />
                <TextInput
                  id="firstName"
                  type="text"
                  color="blue"
                  placeholder={"Enter your First Name"}
                  value={firstName || profileData?.firstName}
                  required
                  onChange={handleFirstNameChange}
                />
              </div>
              <div className="mb-2 w-1/2">
                <Label htmlFor="lastName" value="Last Name" />
                <TextInput
                  id="lastName"
                  type="text"
                  color="blue"
                  placeholder={"Enter your Last Name"}
                  value={lastName || profileData?.lastName}
                  onChange={handleLastNameChange}
                />
              </div>
            </div>

            <div className="flex justify-around gap-4">
              <div className="mb-2 w-1/2">
                <Label htmlFor="email" value="Your email" />
                <TextInput
                  id="email"
                  type="email"
                  color="blue"
                  disabled
                  placeholder={currentUser?.user.email || "Enter your Email Name"}
                />
              </div>

              <div className="mb-2 w-1/2">
                <div className="mb-2 block">
                  <Label htmlFor="phone" value="Phone Number" />
                </div>
                <div className="flex items-center border border-gray-400 rounded-md w-full">
                  <div className="border-r border-black rounded-l-md bg-gray-50 h-10 flex items-center justify-center w-20">
                    <Dropdown label={(countryCode ?? profileData.contactCode) || '+1'} inline={true} color="blue">
                      <div className="max-h-40 overflow-y-auto max-w-72">
                        {countryOptions.map((country) => (
                          <Dropdown.Item
                            key={country.label} // Adding a unique key prop
                            onClick={() =>
                              handleCountryCodeChange(country.countryCode)
                            }
                          >
                            {country.label}
                          </Dropdown.Item>
                        ))}
                      </div>
                    </Dropdown>
                  </div>
                  <div className="w-full">
                    <TextInput
                      id="contactDetails"
                      type="tel"
                      value={phoneNumber || profileData?.contactDetails}
                      onChange={handlechange}
                      placeholder={'123-456-7890'}
                      className="border-none focus:outline-none focus:border-blue-500"
                      color="blue"
                      style={{
                        border: "none",
                        width: "100%",
                        borderTopRightRadius: "7px",
                        borderBottomRightRadius: "7px",
                        borderTopLeftRadius: "0px",
                        borderBottomLeftRadius: "0px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-around gap-4">
              <div className="mb-2 w-1/2">
                <Label htmlFor="location" value="Your Location" />
                <div className="border border-black rounded-md bg-gray-50 h-10 flex items-center justify-center w-full">
                  <Dropdown label={(location || profileData?.location) || "Select Location"} inline={true} color="blue">
                    <div className="max-h-40 overflow-y-auto w-full">
                      {locationOptions.map((option) => (
                        <Dropdown.Item key={option} onClick={() => handleLocationChange(option)} >
                          {option}
                        </Dropdown.Item>
                      ))}
                    </div>
                  </Dropdown>
                </div>
              </div>

              {/* Designation Dropdown */}
              <div className="mb-2 w-1/2">
                <Label htmlFor="designation" value="Your Designation" />
                <div className="border border-black rounded-md bg-gray-50 h-10 flex items-center justify-center w-full">
                  <Dropdown label={(designation || profileData?.designation) || "Select Designation"} inline={true} color="blue">
                    <div className="max-h-40 overflow-y-auto max-w-72">
                      {designationOptions.map((option) => (
                        <Dropdown.Item key={option} onClick={() => handleDesignationChange(option)}>
                          {option}
                        </Dropdown.Item>
                      ))}
                    </div>
                  </Dropdown>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="bio" value="Your bio" />
              </div>
              <Textarea
                id="bio"
                color="blue"
                className="h-32"
                placeholder={"Enter your bio"}
                value={bio || profileData?.bio}
                onChange={handleBioChange}
              />
            </div>
            <Button type="submit" color="blue" className="hover:bg-blue-500 mt-5">
              Update
            </Button>
            <div className="flex items-center justify-between gap-2 mt-5">
              {/* Forgot Password Link */}
              <a href="#" className="text-blue-800 text-base  hover:underline" onClick={() => setIsModalOpen(true)}>
                Change Password?
              </a>
              {/* Sign Out Link */}
              <a href="#" className="text-blue-800 text-base  hover:underline" onClick={handleSignOut}>
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </form>
      {isModalOpen && (<PasswordModal onClose={handleOpenModal} />)}
    </div>
  );
};

export default Profile;