export const checkMyValue = (user, setError, isRegister) => {
 
  let {email:emailInput, password:passwordInput, firsttitle, lasttitle}= user

  if (!emailInput && !passwordInput) {
    setError("Email & Password missing");
    waitThreeSec();  
  } else if (!emailInput) {
    setError("Email is missing");
    waitThreeSec();
  } else if (!passwordInput) {
    setError("Password is missing");
    waitThreeSec();
  } else if (isRegister) {
    if (!firsttitle) {
      setError("First title is missing");
    }
    if (!lasttitle) {
      setError("Last title is missing");
    }
    if (!lasttitle && !firsttitle) {
      setError("Last title and First title are missing");
    }
  }

  if (emailInput && passwordInput) {
    if (validateEmail(emailInput) === true) {
     return true;
    } else {
      setError("Email is not valid");
    }
  }  
};

export const validateEmail = (email) => {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
};


export const waitThreeSec = ()=>{
  setTimeout(() => {
    console.log("something was wrong");
  }, 3000);  
}

export const waitToLoad =(setFunction)=>{
  setTimeout(() => {
    setFunction(false);
  }, 1500); 
}

export const getUsername = (email) => email?.split('@')[0] || '';


export const ValidateTransaction = (transaction) => { 
let errorMessage 
  let {title, amount, type}= transaction
  // console.log(title, isNaN(amount), type)

  if (!title && !amount ) {
    errorMessage ="Title & Amount missing";
    waitThreeSec();  
  } else if (!title) {
    errorMessage ="Title is missing";
    waitThreeSec();
  } else if (!amount) {
    errorMessage ="Amount is missing";
    waitThreeSec();
  }  else if (isNaN(amount)) {
    errorMessage="Amount must be a number";
    waitThreeSec()
  } else if (!type) {
    errorMessage ="Type is not selected";
    waitThreeSec();
};

return errorMessage 
}


export function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: 'numeric', // numeric, 2-digit
    month: 'short', // numeric, 2-digit, long, short, narrow
    day: 'numeric', // numeric, 2-digit
    hour: '2-digit', // numeric, 2-digit
    minute: '2-digit', // numeric, 2-digit
    second: '2-digit', // numeric, 2-digit
    // timeZoneName: 'short' // short, long
  });
}

export const isDateInMonthRange = (providedDateStr, monthType) => {
  const currentDate = new Date();

  const providedDate = new Date(providedDateStr);
  providedDate.setHours(0, 0, 0, 0); 
  let startDate, endDate;

  if (monthType === "current") {
    // Start of the current month, stripping time
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0); 

    endDate = new Date(currentDate); 
    endDate.setHours(0, 0, 0, 0); 
  } else if (monthType === "last") { 
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    startDate.setHours(0, 0, 0, 0); 
    
    // End date is the 30th of the last month, or the last day if it has fewer than 30 days
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    if (endDate.getDate() > 30) {
      endDate.setDate(30); 
    }
    endDate.setHours(0, 0, 0, 0); 
  } else {
    throw new Error('Invalid month type. Use "current" or "last".');
  }
  return providedDate >= startDate && providedDate <= endDate;
};



export const removeFirstLetter = (str) => str.startsWith('/') ? str.slice(1) : str;



// Export the calculateTotal function on budgets
export const totalPlanBugdet = (budgets) => {
  let incomeTotal = 0;
  let extraTotal = 0;
  let expenseTotal = 0;
  let isNotMineTotal = 0;

  budgets.forEach((budget) => {
    const amount = parseFloat(budget.amount);
    if (!isNaN(amount)) {
      switch (budget.category) {
        case "Income":
          incomeTotal += amount;
          break;
        case "Extra":
          extraTotal += amount;
          break;
        case "Expense":
          expenseTotal += amount;
          break;
        case "IsNotMine":
          isNotMineTotal += amount;
          break;
        default:
          break;
      }
    }
  });

  return incomeTotal + extraTotal - expenseTotal - isNotMineTotal;
};



export const getCurrentMonthName = () => {
  const date = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[date.getMonth()];
};


// for styling cards
export const getCardStyle = (category) => {
  switch (category) {
    case "Income":
      return { backgroundColor: "#c8e6c9" };
    case "Expense":
      return { backgroundColor: "#ffcdd2" }; 
    case "Extra":
      return { backgroundColor: "#fff9c4" }; 
    case "IsNotMine":
      return { backgroundColor: "#e1bee7" }; 
    default:
      return { backgroundColor: "#ffffff" };
  }
};

// For style when total is negative

export const getTotalStyle = (total) => {
  if (total < 0) {
    return { color: "red" }; 
  } else {
    return { color: "green" }; 
  }
};