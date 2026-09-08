import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PaymentsIcon from "@mui/icons-material/Payments";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SavingsIcon from "@mui/icons-material/Savings";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import AdjustIcon from "@mui/icons-material/Adjust";
import PaidIcon from "@mui/icons-material/Paid";

import Dashboard from "../Dashboard";
import {
  checkIfAdmin,
  getLoggedUser,
  isAuthenticatedDetails,
  LogoutUser,
} from "../../../firebase/Authentication";
import { useEffect } from "react";
import { useState } from "react";
import { getUsername } from "../../../Helpers/Helpers";

const drawerWidth = 200;

// Budgeto ledger palette — matches Planning.css / Dashboard.css / Archive.css
const ink = "#1C2B29";
const paper = "#EDF1E9";
const paperCard = "#FBFAF4";
const teal = "#0E7C86";
const tealDeep = "#0B646C";
const negative = "#B23A2E";
const line = "#CFD8CB";
const muted = "#5B665F";

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(7)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  backgroundColor: paperCard,
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: ink,
  boxShadow: "none",
  borderBottom: `1px solid rgba(255,255,255,0.08)`,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    backgroundColor: paperCard,
    borderRight: `1px solid ${line}`,
  },
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Navbar() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedUser, setLoggedUser] = useState([]);

  const isAdmin = checkIfAdmin(userId);
  const username = getUsername(loggedUser.email);

  const location = useLocation();

  useEffect(() => {
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    getLoggedUser(setLoggedUser);
  }, [userId]);

  const navigate = useNavigate();

  const handleClick = (text) => {
    if (text === "Log out") {
      LogoutUser();
      navigate("/Login");
    }
    if (text === "Last month") {
      navigate("/Archived");
    }
    if (text === "Current month") {
      navigate("/CurrentTransaction");
    }
    if (text === "Log in") {
      navigate("/Login");
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const icons = [
    <DashboardIcon />,
    <AddBoxIcon />,
    <AdjustIcon />,
    isAdmin && <PaidIcon />,
    isAdmin && <BarChartIcon />,
    isAdmin && <SportsSoccerIcon />,
    isAdmin && <SavingsIcon />,
    isAdmin && <CalendarMonthIcon />,
    isLoggedIn ? <LogoutIcon /> : <LoginIcon />,
  ].filter(Boolean);

  const menu = [
    "Dashboard",
    "Add ",
    "Plan",
    isAdmin && "ToBePaid",
    isAdmin && "Reports",
    isAdmin && "Super",
    isAdmin && "Motivation",
  ].filter(Boolean);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PaymentsIcon fontSize="large" />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                Budgeto
              </Typography>
            </Box>
          </Box>

          <Box
            component={Link}
            to="/UserSettings"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "inherit",
              textDecoration: "none",
              opacity: 0.95,
              "&:hover": { opacity: 1 },
            }}
          >
            <AccountCircleIcon fontSize="large" />
            <Typography
              noWrap
              sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500 }}
            >
              {username}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ borderColor: line }} />
        <List>
          {menu.map((text, index) => {
            const isSelected = location.pathname === "/" + text;
            const isSuper = text === "Super";
            return (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={"/" + text}
                  selected={isSelected}
                  sx={{
                    borderLeft: `3px solid ${
                      isSelected ? teal : "transparent"
                    }`,
                    "&:hover": {
                      backgroundColor: "rgba(14, 124, 134, 0.08)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(14, 124, 134, 0.1)",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "rgba(14, 124, 134, 0.14)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ color: isSuper ? negative : tealDeep, minWidth: 40 }}
                  >
                    {icons[index]}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{
                      sx: {
                        fontFamily: '"Inter", sans-serif',
                        color: ink,
                        fontWeight: isSelected ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ borderColor: line }} />
        <List>
          {["Current month", "Last month", isLoggedIn ? "Log out" : "Log in"].map(
            (text) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  onClick={() => handleClick(text)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(14, 124, 134, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: muted, minWidth: 40 }}>
                    {text === "Log out" || text === "Log in"
                      ? icons[icons.length - 1]
                      : <CalendarMonthIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{
                      sx: { fontFamily: '"Inter", sans-serif', color: ink },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: paper, p: 3 }}
      >
        <DrawerHeader />
        <Dashboard />
      </Box>
    </Box>
  );
}
