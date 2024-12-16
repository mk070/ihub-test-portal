import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  InputBase,
} from "@mui/material";
import { styled, alpha } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from '@mui/icons-material/Email';

import logo from "../../assets/snsihub.png"


const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha("#F3F4F6", 1), // Light gray background for search
  "&:hover": {
    backgroundColor: alpha("#E5E7EB", 1), // Slightly darker on hover
  },
  marginLeft: theme.spacing(1),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "250px",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6B7280", // Neutral gray for search icon
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#1F2937", // Dark gray text
  padding: theme.spacing(1, 1, 1, 0),
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  width: "100%",
}));

const StaffNavbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    handleMenuClose();
  };

  return (
    <>
        <div className={`flex bg-gradient-to-r from-[#00296B] to-[#0077B6] ${window.location.pathname === '/staff/students' || window.location.pathname === '/staffdashboard' ? 'rounded-t-2xl' : 'rounded-2xl'} p-4 mt-3 mx-3 justify-between items-center`}>
            <div className="flex items-center gap-8">
              <img src={logo} alt="Logo" className="h-10" />
              
            </div>
            <div className="flex ml-40 items-center gap-8">
              <nav className="flex gap-6 text-white">
                <Link to="/staffdashboard" className="font-medium text-white hover:text-yellow-500">
                    Home
                </Link>
                <Link to="/students" className="font-medium text-white hover:text-yellow-500">
                   Student
                </Link>
                <Link to="/library" className="font-medium  text-white hover:text-yellow-500">
                  Library
                </Link>
                <a href="#" className="font-medium"></a>
                <a href="/" className="font-medium"></a>
              </nav>
            </div>
            <div className="flex items-center gap-4 text-white">
              <button className="p-2"><SearchIcon /></button>
              <button className="p-2"><EmailIcon /></button>
              <div className="flex items-center mr-2 gap-2">
                {/* <img src="/avatar.png" alt="User" className="h-8 w-8 rounded-full" /> */}
                <span>Herbert</span>
              </div>
            </div>
          </div>
    </>
  );
};

export default StaffNavbar;
