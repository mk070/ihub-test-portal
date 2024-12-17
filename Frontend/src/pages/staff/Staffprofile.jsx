import React, { useEffect, useState } from "react";
import axios from "axios";

const StaffProfile = () => {
  const [staffDetails, setStaffDetails] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:8000/staff/profile", { withCredentials: true })
      .then((response) => {
        setStaffDetails(response.data);
      })
      .catch((error) => {
        console.error("Error fetching staff profile", error);
      });
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Staff Profile</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p>
          <strong>Name:</strong> {staffDetails.name}
        </p>
        <p>
          <strong>Email:</strong> {staffDetails.email}
        </p>
        <p>
          <strong>Department:</strong> {staffDetails.department}
        </p>
        <p>
          <strong>College:</strong> {staffDetails.collegename}
        </p>
      </div>
    </div>
  );
};

export default StaffProfile;
