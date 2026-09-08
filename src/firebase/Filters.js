import { KEYWORDS } from "./CONSTANTS";
import { listTransactions } from "./getTransactions";
import { formatTime, isDateInMonthRange } from "../Helpers/Helpers";

export const getCurrentMonthRange = () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getLastMonthRange = () => {
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setMonth(end.getMonth());
  end.setDate(0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getYearRange = () => {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const end = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
};

export const fetchFilteredTransactions = async (
  filterType,
  searchTerm,
  setData
) => {
  let dateRange;

  switch (filterType) {
    case "currentMonth":
      dateRange = getCurrentMonthRange();
      break;
    case "lastMonth":
      dateRange = getLastMonthRange();
      break;
    case "wholeYear":
      dateRange = getYearRange();
      break;
    default:
      // If no date filter is selected, default to not filtering by date
      dateRange = null;
  }

  try {
    const allTransactions = await listTransactions(); // Adjust to actually fetch transactions
    const filteredTransactions = allTransactions.filter((transaction) => {
      const matchesDate = dateRange
        ? new Date(transaction.createdAt) >= dateRange.start &&
          new Date(transaction.createdAt) <= dateRange.end
        : true; // If no dateRange is provided, don't filter by date
      const matchesSearchTerm = searchTerm
        ? transaction.title.toLowerCase().includes(searchTerm.toLowerCase())
        : true; // If no searchTerm is provided, don't filter by term

      return matchesDate && matchesSearchTerm;
    });

    setData(filteredTransactions);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  }
};

// Example button handlers
export const handleCurrentMonth = () =>   fetchFilteredTransactions("currentMonth");
export const handleLastMonth = () => fetchFilteredTransactions("lastMonth");
export const handleWholeYear = () => fetchFilteredTransactions("wholeYear");

// filter and return total and list
export function filterTransactionsAndCalculateTotal(transactions, keywords) {
  let totalExpense = 0;
  let totalIncome = 0;
  const sortedTransactions = transactions.sort(
    (a, b) => b.createdAt - a.createdAt
  );
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    const matchesKeyword = keywords.some((keyword) =>
      transaction.title.toLowerCase().includes(keyword)
    );
    if (matchesKeyword) {
      if (transaction.type === "Income" || "income") {
        totalExpense += parseFloat(transaction.amount);
      } else if (transaction.type === "Expense" || "expense") {
        totalIncome += parseFloat(transaction.amount);
      }
    }
    return matchesKeyword;
  });

  let total = totalExpense - totalIncome;

  return {
    filteredTransactions,
    total,
  };
}


export function listAlltransactionWithoutSuper(transactions, filterKeywords) {
  let totalExpense = 0;
  let totalIncome = 0;

transactions.filter((transaction) => {
    // Convert type to lowercase for case-insensitive comparison
    const type = transaction.type.toLowerCase();

    // Check if transaction title matches any of the filter keywords
    const matchesKeyword = filterKeywords.some((keyword) =>
      transaction.title.toLowerCase().includes(keyword)
    );

    // Only consider transactions that do not match any filter keyword
    if (!matchesKeyword) {
      // Accumulate total expenses and income based on transaction type
      if (type === "expense") {
        totalExpense += parseFloat(transaction.amount) || 0;
      } else if (type === "income") {
        totalIncome += parseFloat(transaction.amount) || 0;
      }
    }

    // Return true if the transaction does not match the filter keywords
    return !matchesKeyword;
  });

  return { totalExpense, totalIncome };
}


// filter and return total and list
export function filterBenefits(transactions) {
  let totalBenefits = 0;

  if (!transactions) {
    return {
      filteredBenefits: [],
      totalBenefits: 0,
    };
  }

  // Sort transactions by createdAt date in descending order
  const sortedTransactions = transactions.sort((a, b) => b.createdAt - a.createdAt);
  
  // Filter transactions to include only those with type "extra" or "Extra"
  const filteredBenefits = sortedTransactions.filter((transaction) => {
    const type = transaction.type.toLowerCase(); // Normalize type to lowercase
    if (type === "extra") {
      totalBenefits += parseFloat(transaction.amount) || 0; // Safely parse amount
      return true;
    }
    return false;
  });

 
  return {
    filteredBenefits,
    totalBenefits,
  };
}

//fetch anything created with keyword home or Home or Biedronka or Auchan, Zabka

export function listHomeAndStoresExpenses(transactions) {
  let totalExpense = 0;

  // Define the keywords to look for (case-insensitive)
  const filterKeywords = ["home", "biedronka", "auchan", "zabka"];

  transactions.filter((transaction) => {
    // Convert type to lowercase for case-insensitive comparison
    const type = transaction.type.toLowerCase();

    // Only process transactions where the type is "expense"
    if (type === "expense") {
      // Convert expense to lowercase for case-insensitive comparison
      const expense = transaction.expense ? transaction.expense.toLowerCase() : '';

      // Check if the expense contains any of the keywords
      const matchesKeyword = filterKeywords.some((keyword) =>
        expense.includes(keyword)
      );

      // If it matches a keyword, accumulate the total expense
      if (matchesKeyword) {
        totalExpense += parseFloat(transaction.amount) || 0;
      }

      // Return true if the transaction matches the filter keywords
      return matchesKeyword;
    }
    return false; // Return false for non-expense transactions
  });

  return { totalExpense };
}

// list transaction based on the date current or last month
export function listTransactionsByMonthAndType(transactions, monthType) {
  let totalExpense = 0;
  let totalIncome = 0;
  let totalExtra = 0; 
  let matchingTransactions = [];


  transactions.forEach((transaction) => {
   
  const transactionTimestamp = transaction.createdAt;    
  const transactionDate = formatTime(transactionTimestamp);

  const type = transaction.type.toLowerCase(); 

    let withinDateRange = isDateInMonthRange(transactionDate,monthType);     
    if (withinDateRange) {   
      const containsKeyword = KEYWORDS.some(keyword => transaction.title.toLowerCase().includes(keyword.toLowerCase()));
      if (!containsKeyword) {
          if (type === "expense") {        
              totalExpense += parseFloat(transaction.amount) || 0;
              matchingTransactions.push({ ...transaction }); 
          } else if (type === "income") {
              totalIncome += parseFloat(transaction.amount) || 0;
              matchingTransactions.push({ ...transaction }); 
          } else if (type === "extra") {
              totalExtra += parseFloat(transaction.amount) || 0;
              matchingTransactions.push({ ...transaction }); 
          }
      }
  }
  });
  return { totalExpense, totalIncome, totalExtra, matchingTransactions };
}


// list what is not mine like credit or what I need to pay back
export function filterWhatIsNotMine(transactions) {
  let totalWhatIsNotMine = 0;

  if (!transactions) {
    return {
      filteredWhatIsNotMine: [],
      totalWhatIsNotMine: 0,
    };
  }

  // Sort transactions by createdAt date in descending order
  const sortedTransactions = transactions.sort((a, b) => b.createdAt - a.createdAt);

  
  // Filter transactions to include only those with type "isNotMine"
  const filteredWhatIsNotMine = sortedTransactions.filter((transaction) => {
    const type = transaction.type; 
    if (type === "isNotMine") {   
      totalWhatIsNotMine += parseFloat(transaction.amount) || 0; // Safely parse amount
      return true;
    }
    return false;
  });
 
   return {
    filteredWhatIsNotMine,
    totalWhatIsNotMine,
  };
}








