import React, { useState, useEffect } from 'react';
import { getCurrentMonthName } from '../../Helpers/Helpers';
import { addArchivedPlan, archivePlan } from '../../firebase/ArchiveLogics';
import { isAuthenticatedDetails } from '../../firebase/Authentication';


// Independent ArchivePlanButton Component
const ArchivePlanButton = ({ currentTotalAmount}) => {
  const [archived, setArchived] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // Store the user ID
  
  // Set current month on component mount
  useEffect(() => {
    setCurrentMonth(getCurrentMonthName());
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
  }, []);

  // Function to handle archiving the plan
  const handleArchivePlan = async () => {
    console.log(`Archiving plan for ${currentMonth} with total amount: $${currentTotalAmount}`);
    const plan = { month: currentMonth, amount: currentTotalAmount };
       
    try {
      await archivePlan(userId, plan); // Assuming this is the correct function to call
      setArchived(true);
    } catch (error) {
      console.error('Error archiving plan:', error);
     
    }
  };

  return (
    <div>
      <button onClick={handleArchivePlan} disabled={archived}>
        {archived 
          ? `Plan for ${currentMonth} Archived`
          : `Archive Plan for ${currentMonth} - Amount:  PLN${currentTotalAmount}`}
      </button> 
    </div>
  );
};

export default ArchivePlanButton;
