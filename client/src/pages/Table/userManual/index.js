import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { saveAs } from "file-saver";
import Select from "react-select";
import Papa from "papaparse";
import { Dropdown } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { Range } from "react-range";

const UserManual = () => {
    const [data, setData] = useState([]);
    const { currentUser } = useSelector((state) => state.user);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [selectedRegion, setSelectedRegion] = useState([]);
    const [selectedDesignation, setSelectedDesignation] = useState([]);
    const [filteredOccupancy, setFilteredOccupancy] = useState([0, 100]);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const itemsPerPage = 20;

    const regionOptions = [
        { value: "France", label: "France" },
        { value: "Germany", label: "Germany" },
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "India", label: "India" },
        { value: "Spain", label: "Spain" },
        { value: "NA", label: "Other" },
    ];

    const designationOptions = [
        { value: "Graduate Engineering Trainee", label: "Graduate Engineering Trainee" },
        { value: "Solution Developer", label: "Solution Developer" },
        { value: "Sr. Solution Developer", label: "Sr. Solution Developer" },
        { value: "SME Aerospace", label: "SME Aerospace" },
        { value: "Technical Lead", label: "Technical Lead" },
        { value: "Sr. Technical Lead", label: "Sr. Technical Lead" },
        { value: "AVP-DES Delivery", label: "AVP-DES Delivery" },
        { value: "Project Manager", label: "Project Manager" },
        { value: "Engagement Manager", label: "Engagement Manager" },
        { value: "Sr. Engagement Manager", label: "Sr. Engagement Manager" },
        { value: "VP-DES Delivery", label: "VP-DES Delivery" },
    ];

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            border: "2px solid gray",
            borderRadius: "0.375rem",
            padding: "0.25rem",
            boxShadow: state.isFocused ? "0 0 0 3px rgba(29, 78, 216, 0.3)" : "none",
            "&:hover": {
                borderColor: "#1D4ED8",
            },
            backgroundColor: "transparent",
        }),
        input: (provided) => ({
            ...provided,
            color: "#1D4ED8",
            "& input": {
                boxShadow: "none",
                caretColor: "#1D4ED8", // Custom caret color
                outline: "none", // Remove outline to get rid of the blue box
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#DBEAFE",
            color: "#1D4ED8",
            fontWeight: "bold",
            borderRadius: "0.25rem",
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "#1D4ED8",
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: "#1D4ED8",
            "&:hover": {
                backgroundColor: "#BFDBFE",
                color: "#1D4ED8",
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9CA3AF",
            fontWeight: "bold",
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? "#1D4ED8" : "#9CA3AF",
            "&:hover": {
                color: "#1D4ED8",
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: "#9CA3AF",
            "&:hover": {
                color: "#1D4ED8",
            },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.375rem",
            boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 9999,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#DBEAFE" : "#FFFFFF",
            color: "#1D4ED8",
            "&:hover": {
                backgroundColor: "#DBEAFE",
            },
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };

    useEffect(() => {
        fetchData();
    }, [
        currentPage,
        query,
        filteredOccupancy,
        selectedRegion,
        selectedDesignation
    ]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${apiUrl}/profile/getProfileDetails`, {
                withCredentials: true,
            });
            const responseData = res.data;

            if (responseData.success === false) {
                console.log(responseData.message);
            } else {
                let filteredData = responseData;

                if (query) {
                    filteredData = filteredData.filter(
                        (item) =>
                            item.username &&
                            item.username
                                .toLowerCase()
                                .includes(query.toLowerCase())
                    );
                }

                filteredData = filteredData.filter(
                    (item) =>
                        item.totalOccupancy >= filteredOccupancy[0] &&
                        item.totalOccupancy <= filteredOccupancy[1]
                );

                if (selectedRegion.length > 0) {
                    filteredData = filteredData.filter((item) =>
                        selectedRegion.map(region => region.value).includes(item.location)
                    );
                }

                // Filter by selected designation
                if (selectedDesignation.length > 0) {
                    filteredData = filteredData.filter((item) =>
                        selectedDesignation.map(designation => designation.value).includes(item.designation)
                    );
                }
                setData(filteredData);
                setPageCount(Math.ceil(filteredData.length / itemsPerPage));
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const handlePageClick = (e) => {
        setCurrentPage(e.selected);
    };

    const handleUserProfile = (id) => {
        navigate(`/users/profile/${id}`)
    }

    const handleRegionChange = (selectedOptions) => {
        setSelectedRegion(selectedOptions);
    };

    const handleDesignationChange = (selectedOptions) => {
        setSelectedDesignation(selectedOptions);
    };

    const handleMissionClick = (id) => {        
        console.log(id);
        window.open(`/mission-details/${id}`, "_blank");
    }

    // Export data as CSV
    const handleExportCSV = () => {
        const csv = Papa.unparse(data, {
            header: true,
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "user_manual.csv");
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center w-full">
                <p className="text-3xl font-bold text-blue-800 mb-4 ">User Occupancy</p>
                {(currentUser.user.user_type === "Leader" ||
                    currentUser.user.user_type === "Admin") && (
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center text-white bg-green-500 border border-gray-300 focus:outline-none mx-1 hover:bg-green-700 focus:ring-4 focus:ring-green-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-green-400 dark:border-green-600 dark:hover:bg-gray-700 dark:hover:border-green-700 dark:focus:ring-green-700"
                        >
                            Export as CSV
                        </button>
                    )}
            </div>
            {/* Occupancy Filter */}
            <div className="mb-4">
                <p className="text-lg font-medium text-gray-700 mb-2">Filter by Occupancy (%):</p>
                <Range
                    step={5}
                    min={0}
                    max={100}
                    values={filteredOccupancy}
                    onChange={(values) => setFilteredOccupancy(values)}
                    renderTrack={({ props, children }) => (
                        <div
                            {...props}
                            className="w-full h-2 bg-gray-200 rounded-lg"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 ${filteredOccupancy[0]}%, #4ade80 ${filteredOccupancy[1]}%)`,
                            }}
                        >
                            {children}
                        </div>
                    )}
                    renderThumb={({ props }) => (
                        <div
                            {...props}
                            className="w-4 h-4 bg-blue-600 rounded-full shadow-lg focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    )}
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>0%</span>
                    <span>{filteredOccupancy[0]}% - {filteredOccupancy[1]}%</span>
                    <span>100%</span>
                </div>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-t-lg">
                <div className="flex items-center justify-between flex-column md:flex-row pl-[20px] pr-[20px] flex-wrap space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900 gap-8">
                    <label htmlFor="table-search" className="sr-only">
                        Search
                    </label>
                    <div className="relative h-fit">
                        <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none justify-center">
                            <svg
                                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="table-search-users"
                            className="block pt-2 ps-10 text-sm w- text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={(e) => {
                                setQuery(e.target.value);
                            }}
                            placeholder="Search for Username"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Select
                            id="selectedRegion"
                            value={selectedRegion}
                            onChange={handleRegionChange}
                            options={regionOptions}
                            isMulti
                            styles={customStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            placeholder="Region..."
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Select
                            id="selectedDesignation"
                            value={selectedDesignation}
                            onChange={handleDesignationChange}
                            options={designationOptions}
                            isMulti
                            styles={customStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            placeholder="Designation..."
                        />
                    </div>

                </div>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white max-h-[60vh]">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-[3]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-center">
                                Sr No.
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                User Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Location
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Designation
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Contact Details
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Total occupancy
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Missions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data &&
                            data
                                .slice(
                                    currentPage * itemsPerPage,
                                    (currentPage + 1) * itemsPerPage
                                )
                                .map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {data.indexOf(item) + 1}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap cursor-pointer hover:text-purple-700 hover:font-semibold" onClick={() => handleUserProfile(item.userId)}>
                                            {item.username}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {item?.location || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {item?.designation || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.contactDetails || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item?.totalOccupancy || "0"} %
                                        </td>
                                        <td className="text-sm font-medium text-gray-400 flex justify-center items-center whitespace-nowrap">
                                            <Dropdown
                                                inline
                                                label="Missions"
                                                className="w-fit relative border rounded-md dropdown-menu"
                                            >
                                                {item.missions &&
                                                    item.missions
                                                        .map((data, index) => (
                                                            <Dropdown.Item
                                                                key={index}
                                                                value={data.missionId}
                                                            >
                                                                <button
                                                                    onClick={() => handleMissionClick(data.id)}
                                                                >
                                                                <span className={`badge ${data.active ? 'badge-outline-primary' : 'badge-outline-dark'} text-center flex flex-col`}>
                                                                    <p>Mission Id: {data.missionId}</p>
                                                                    <p>Individual Occupancy: {data.individualOccupancy} %</p>
                                                                </span>
                                                                </button>
                                                            </Dropdown.Item>
                                                        ))}
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-between items-center gap-8 w-full">
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                    Showing {currentPage * itemsPerPage + 1} -{" "}
                    {Math.min((currentPage + 1) * itemsPerPage, data.length)} of{" "}
                    {data.length} Items
                </div>
                <ReactPaginate
                    previousLabel={"←"}
                    nextLabel={"→"}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    previousLinkClassName={"pagination__link"}
                    nextLinkClassName={"pagination__link"}
                    disabledClassName={"pagination__link--disabled"}
                    activeClassName={"pagination__link--active"}
                />
            </div>
        </div>
    );
};

export default UserManual;
