import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PaymentsIcon from "@mui/icons-material/Payments";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HistoryIcon from "@mui/icons-material/History";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SavingsIcon from "@mui/icons-material/Savings";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import AdjustIcon from "@mui/icons-material/Adjust";
import PaidIcon from "@mui/icons-material/Paid";
import { Link, useNavigate, useLocation } from "react-router-dom";

import Dashboard from "../Dashboard";
import {
  checkIfAdmin,
  getLoggedUser,
  isAuthenticatedDetails,
  LogoutUser,
} from "../../../firebase/Authentication";
import { getUsername } from "../../../Helpers/Helpers";

const drawerWidth = 220;
const mobileDrawerWidth = 260;

// Budgeto ledger palette, shared with the landing page and Dashboard.css
const ink = "#1C2B29";
const paper = "#EDF1E9";
const paperCard = "#FFFFFF";
const teal = "#0E7C86";
const tealDeep = "#0B646C";
const negative = "#B23A2E";
const line = "#DDE3D7";
const muted = "#4D5F55";

/* ------------------------------------------------------------------
   Navigation config: one source of truth (replaces the parallel
   `icons` and `menu` arrays that had to stay in the same order).
------------------------------------------------------------------- */

const MAIN_NAV = [
  { label: "Dashboard", to: "/Dashboard", icon: DashboardIcon },
  // NOTE: the original path was "/" + "Add " (with a trailing space).
  // Kept as-is so navigation keeps working; if your route is "/Add",
  // change `to` here and in your router.
  { label: "Add", to: "/Add ", icon: AddBoxIcon },
  { label: "Plan", to: "/Plan", icon: AdjustIcon },
  { label: "ToBePaid", to: "/ToBePaid", icon: PaidIcon, adminOnly: true },
  { label: "Reports", to: "/Reports", icon: BarChartIcon, adminOnly: true },
  {
    label: "Super",
    to: "/Super",
    icon: SportsSoccerIcon,
    adminOnly: true,
    iconColor: negative, // red on purpose: this is the betting tracker
  },
  { label: "Motivation", to: "/Motivation", icon: SavingsIcon, adminOnly: true },
  { label: "Side hustle", to: "/SideHustle", icon: SavingsIcon, adminOnly: true },
];

const MONTH_NAV = [
  { label: "Current month", to: "/CurrentTransaction", icon: CalendarMonthIcon },
  { label: "Last month", to: "/Archived", icon: HistoryIcon },
];

/* ------------------------------------------------------------------
   Styled pieces
------------------------------------------------------------------- */

const reducedMotion = {
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
};

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  ...reducedMotion,
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  ...reducedMotion,
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: ink,
  color: "#FFFFFF",
  boxShadow: "none",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...reducedMotion,
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const PermanentDrawer = styled(MuiDrawer, {
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
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      backgroundColor: paperCard,
      borderRight: `1px solid ${line}`,
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      backgroundColor: paperCard,
      borderRight: `1px solid ${line}`,
    },
  }),
}));

const itemSx = (selected) => ({
  minHeight: 48,
  px: "13px", // keeps icons centred in the collapsed rail (3px border + 13px)
  borderLeft: `3px solid ${selected ? teal : "transparent"}`,
  "&:hover": { backgroundColor: "rgba(14, 124, 134, 0.08)" },
  "&.Mui-selected": { backgroundColor: "rgba(14, 124, 134, 0.1)" },
  "&.Mui-selected:hover": { backgroundColor: "rgba(14, 124, 134, 0.14)" },
  "&.Mui-focusVisible": {
    outline: `2px solid ${tealDeep}`,
    outlineOffset: -2,
  },
});

const labelProps = (selected) => ({
  sx: {
    fontFamily: '"Inter", sans-serif',
    fontSize: "0.95rem",
    color: ink,
    fontWeight: selected ? 600 : 400,
  },
});

/* ------------------------------------------------------------------
   Navbar
------------------------------------------------------------------- */

export default function Navbar({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), {
    noSsr: true,
  });

  const [open, setOpen] = React.useState(false); // desktop: expanded rail
  const [mobileOpen, setMobileOpen] = React.useState(false); // mobile: drawer
  const [userId, setUserId] = React.useState(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loggedUser, setLoggedUser] = React.useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = checkIfAdmin(userId);
  const username = getUsername(loggedUser?.email);

  // Subscribe once. (It used to re-run whenever userId changed, which
  // stacked up duplicate auth listeners.)
  React.useEffect(() => {
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    getLoggedUser(setLoggedUser);
  }, []);

  // Leaving mobile layout should never leave a modal drawer open
  React.useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const currentPath = decodeURIComponent(location.pathname).trim();
  const isActive = (to) => {
    const target = to.trim();
    return currentPath === target || currentPath.startsWith(`${target}/`);
  };

  const mainItems = MAIN_NAV.filter((item) => !item.adminOnly || isAdmin);

  const handleMenuButton = () => (isMobile ? setMobileOpen(true) : setOpen(true));
  const closeDrawer = () => (isMobile ? setMobileOpen(false) : setOpen(false));
  const closeIfMobile = () => {
    if (isMobile) setMobileOpen(false);
  };

  const handleAuthAction = () => {
    if (isLoggedIn) LogoutUser();
    navigate("/Login");
    closeIfMobile();
  };

  const renderLinkItem = (item, collapsed) => {
    const selected = isActive(item.to);
    const Icon = item.icon;
    return (
      <ListItem key={item.label} disablePadding>
        <Tooltip title={collapsed ? item.label : ""} placement="right">
          <ListItemButton
            component={Link}
            to={item.to}
            selected={selected}
            aria-current={selected ? "page" : undefined}
            onClick={closeIfMobile}
            sx={itemSx(selected)}
          >
            <ListItemIcon
              sx={{ color: item.iconColor || tealDeep, minWidth: 40 }}
            >
              <Icon />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={labelProps(selected)}
            />
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  const authLabel = isLoggedIn ? "Log out" : "Log in";
  const AuthIcon = isLoggedIn ? LogoutIcon : LoginIcon;

  const drawerContent = (collapsed) => (
    <>
      <DrawerHeader>
        {!collapsed && (
          <IconButton onClick={closeDrawer} aria-label="Close menu">
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        )}
      </DrawerHeader>
      <Divider sx={{ borderColor: line }} />

      <List component="nav" aria-label="Main">
        {mainItems.map((item) => renderLinkItem(item, collapsed))}
      </List>

      {/* pushes the month + account group to the bottom */}
      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ borderColor: line }} />
      <List component="nav" aria-label="Months and account">
        {MONTH_NAV.map((item) => renderLinkItem(item, collapsed))}

        <ListItem disablePadding>
          <Tooltip title={collapsed ? authLabel : ""} placement="right">
            <ListItemButton onClick={handleAuthAction} sx={itemSx(false)}>
              <ListItemIcon sx={{ color: muted, minWidth: 40 }}>
                <AuthIcon />
              </ListItemIcon>
              <ListItemText
                primary={authLabel}
                primaryTypographyProps={labelProps(false)}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* keyboard users can jump past the navigation */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.drawer + 2,
          px: 2,
          py: 1,
          borderRadius: 1,
          backgroundColor: paperCard,
          color: ink,
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.9rem",
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>

      <AppBar position="fixed" open={open && !isMobile}>
        <Toolbar sx={{ justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <IconButton
              color="inherit"
              aria-label="Open menu"
              onClick={handleMenuButton}
              edge="start"
              sx={{ ...(open && !isMobile && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              component={Link}
              to="/Dashboard"
              aria-label="Budgeto, go to dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "inherit",
                textDecoration: "none",
                minWidth: 0,
              }}
            >
              <PaymentsIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              <Typography
                variant="h6"
                noWrap
                component="span"
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
            aria-label={`Account settings${username ? ` for ${username}` : ""}`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              minHeight: 44,
              color: "inherit",
              textDecoration: "none",
              opacity: 0.95,
              "&:hover": { opacity: 1 },
            }}
          >
            <AccountCircleIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            <Typography
              noWrap
              sx={{
                display: { xs: "none", sm: "block" },
                maxWidth: 180,
                fontFamily: '"Inter", sans-serif',
                fontWeight: 500,
              }}
            >
              {username || "Account"}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <MuiDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: mobileDrawerWidth,
              maxWidth: "85vw",
              boxSizing: "border-box",
              backgroundColor: paperCard,
              borderRight: `1px solid ${line}`,
            },
          }}
        >
          {drawerContent(false)}
        </MuiDrawer>
      ) : (
        <PermanentDrawer variant="permanent" open={open}>
          {drawerContent(!open)}
        </PermanentDrawer>
      )}

      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          minWidth: 0, // lets wide content scroll instead of widening the page
          minHeight: "100vh",
          "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
          backgroundColor: paper,
          outline: "none",
          // Pages own their padding (Dashboard has its own), so no extra p here
        }}
      >
        {/* plain spacer under the fixed AppBar (the old DrawerHeader spacer
            had a white background and showed as a band above the page) */}
        <Toolbar />
        {children ?? <Dashboard />}
      </Box>
    </Box>
  );
}
