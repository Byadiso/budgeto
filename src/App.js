import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./components/pages/LandingPage.jsx";

import Login from "./components/pages/UserAuth/Login.jsx";
import NoMatch from "./components/pages/ErrorComponents/NoMatch.jsx";
import Logout from "./components/pages/UserAuth/Logout.jsx";
import Register from "./components/pages/UserAuth/RegisterComponent.jsx";
import Navbar from "./components/pages/Layouts/Navbar.jsx";
import AddRecord from "./components/pages/AddRecord.jsx";
import SuperBet from "./components/pages/SuperBet.jsx";
import Benefits from "./components/pages/Benefits.jsx";
import Motivation from "./components/pages/Motivation.jsx";
import Planning from "./components/pages/Planning.jsx";
import Transaction from "./components/pages/Transaction.jsx";
import ArchiveCard from "./components/pages/Archived.jsx";
import CurrentTransaction from "./components/pages/CurrentTransaction.jsx";
import Reports from "./components/pages/Reports.jsx";
import ToBePaid from "./components/pages/ToBePaid.jsx";
import UserSettings from "./components/pages/UserSettings.jsx";



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} /> 
          <Route path="https://byadiso.github.io/budgeto/" element={<LandingPage />} />
          
          <Route path="/Plan" element={<Planning />} />             

          <Route path="/bugdeto" element={<LandingPage />} />                         

          <Route path="/Dashboard" element={<Navbar />} />

          <Route path="/Benefits" element={<Benefits />} />
          <Route path="/ToBePaid" element={<ToBePaid />} />

          <Route path="/Add" element={<AddRecord />} />
          <Route path="/Reports" element={<Reports />} />

          <Route path="/Motivation" element={<Motivation />} />          

          <Route path="/Super" element={<SuperBet />} />
          <Route path="/Transaction/:id" element={<Transaction />} />

          <Route path="/Archived" element={<ArchiveCard />} />
          <Route path="/CurrentTransaction" element={<CurrentTransaction />} />     

          
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />

          <Route path="/UserSettings" element={<UserSettings />} />


          

          <Route path="/Logout" element={<Logout />} />
          {/* routes when no match */}
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
