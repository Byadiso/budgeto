import React, { useCallback, useEffect, useMemo, useState } from "react";
import { isAuthenticatedDetails } from "../../firebase/Authentication";
import { Link } from "react-router-dom";
import "../../Style/Planning.css";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import BudgetModal from "../Modals/BudgetModal";
import {
  createPlan,
  readPlans,
  editPlan,
  deletePlan,
} from "../../firebase/Plan";
import {
  getCardStyle,
  getCurrentMonthName,
  getTotalStyle,
  totalPlanBugdet,
  waitToLoad,
} from "../../Helpers/Helpers";
import ArchivePlanButton from "./ArchivePlans";
import NoAccess from "./ErrorComponents/NoAccess";

const SORTS = [
  { value: "amountDesc", label: "Largest first" },
  { value: "amountAsc", label: "Smallest first" },
  { value: "name", label: "A to Z" },
  { value: "category", label: "Category" },
];

const fmt = (n) =>
  new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

const amountOf = (b) => parseFloat(b.amount) || 0;

function PlanningSkeleton() {
  return (
    <div className="ledger_page" role="status" aria-busy="true">
      <span className="ledger_sr_only">Loading plans…</span>
      <div className="ledger_register">
        <div className="ledger_skel ledger_skel_title" />
        <div className="ledger_skel ledger_skel_hero" />
        <div className="ledger_skel ledger_skel_row" />
        <div className="ledger_skel ledger_skel_row" />
        <div className="ledger_skel ledger_skel_row" />
      </div>
    </div>
  );
}

function Planning() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("amountDesc");
  const [category, setCategory] = useState("all");
  const [confirmId, setConfirmId] = useState(null);

  const currentMonth = getCurrentMonthName();

  useEffect(() => {
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    waitToLoad(setLoading);
  }, [isLoggedIn]);

  const fetchBudgets = useCallback(async (uid) => {
    const plans = (await readPlans(uid)) || {};
    const plansArray = Object.keys(plans).map((key) => ({
      id: key,
      ...plans[key],
    }));
    setBudgets(plansArray);
  }, []);

  useEffect(() => {
    if (userId) fetchBudgets(userId);
  }, [userId, fetchBudgets]);

  // delete confirmation resets itself after 4 seconds
  useEffect(() => {
    if (!confirmId) return;
    const t = setTimeout(() => setConfirmId(null), 4000);
    return () => clearTimeout(t);
  }, [confirmId]);

  /* ---------- handlers (all work with ids, not list positions) ---------- */

  const handleAddNewPlan = () => {
    setCurrentBudget(null);
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (id) => {
    setCurrentBudget(budgets.find((b) => b.id === id) || null);
    setEditId(id);
    setIsModalOpen(true);
  };

  const handleAddOrEditBudget = async (newBudget) => {
    if (editId !== null) {
      await editPlan(userId, editId, newBudget);
      setBudgets((prev) =>
        prev.map((b) => (b.id === editId ? { ...newBudget, id: editId } : b))
      );
    } else {
      await createPlan(userId, newBudget);
      await fetchBudgets(userId); // real id from the database
    }
    setIsModalOpen(false);
  };

  const handleRemoveBudget = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    await deletePlan(userId, id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    setConfirmId(null);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
  };

  /* ---------- derived data ---------- */

  const totalAmount = totalPlanBugdet(budgets);
  const grandTotal = useMemo(
    () => budgets.reduce((sum, b) => sum + Math.max(amountOf(b), 0), 0),
    [budgets]
  );

  // category -> { total, count }
  const categories = useMemo(() => {
    const map = new Map();
    budgets.forEach((b) => {
      const key = b.category || "Other";
      const cur = map.get(key) || { name: key, total: 0, count: 0 };
      cur.total += Math.max(amountOf(b), 0);
      cur.count += 1;
      map.set(key, cur);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [budgets]);

  // if the active category disappeared (e.g. last entry deleted), show all
  const activeCategory = categories.some((c) => c.name === category)
    ? category
    : "all";

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = budgets.filter((b) => {
      if (activeCategory !== "all" && (b.category || "Other") !== activeCategory)
        return false;
      if (term && !(b.name || "").toLowerCase().includes(term)) return false;
      return true;
    });

    const sorters = {
      amountDesc: (a, b) => amountOf(b) - amountOf(a),
      amountAsc: (a, b) => amountOf(a) - amountOf(b),
      name: (a, b) => (a.name || "").localeCompare(b.name || ""),
      category: (a, b) =>
        (a.category || "").localeCompare(b.category || "") ||
        amountOf(b) - amountOf(a),
    };
    return list.sort(sorters[sort]);
  }, [budgets, activeCategory, search, sort]);

  const biggest = useMemo(
    () => [...budgets].sort((a, b) => amountOf(b) - amountOf(a))[0],
    [budgets]
  );

  const isFiltered = activeCategory !== "all" || search.trim() !== "";
  const visibleTotal = visible.reduce((s, b) => s + amountOf(b), 0);

  /* ---------- render ---------- */

  if (loading) return <PlanningSkeleton />;

  if (!isLoggedIn) {
    return (
      <div className="ledger_page">
        <NoAccess />
      </div>
    );
  }

  return (
    <div className="ledger_page">
      <div className="ledger_topbar">
        <Link to="/Dashboard" className="ledger_back">
          <ArrowBackIcon fontSize="small" />
          Go back
        </Link>
      </div>

      <div className="ledger_register">
        <header className="ledger_header">
          <div>
            <p className="ledger_month">{currentMonth}</p>
            <h1 className="ledger_title">Planning</h1>
          </div>
          <button
            type="button"
            onClick={handleAddNewPlan}
            className="ledger_primary_btn"
          >
            <AddIcon fontSize="small" />
            New budget
          </button>
        </header>

        {/* ---------- overview ---------- */}
        <section className="ledger_balance" aria-label="Plan overview">
          <span className="ledger_balance_label">Total planned</span>
          <h2
            className="ledger_balance_amount"
            style={getTotalStyle(totalAmount)}
          >
            {totalAmount} <span className="ledger_currency">PLN</span>
          </h2>
          <p className="ledger_balance_meta">
            {budgets.length} {budgets.length === 1 ? "budget" : "budgets"} in{" "}
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </p>

          {grandTotal > 0 && (
            <>
              <div
                className="ledger_split"
                role="img"
                aria-label="Share of the plan by category"
              >
                {categories.map((c) => (
                  <span
                    key={c.name}
                    className="ledger_split_seg"
                    style={{
                      ...getCardStyle(c.name),
                      width: `${(c.total / grandTotal) * 100}%`,
                    }}
                    title={`${c.name}: ${fmt(c.total)} PLN`}
                  />
                ))}
              </div>

              <ul className="ledger_legend">
                {categories.map((c) => (
                  <li key={c.name} className="ledger_legend_item">
                    <span
                      className="ledger_legend_dot"
                      style={getCardStyle(c.name)}
                    />
                    <span className="ledger_legend_name">{c.name}</span>
                    <span className="ledger_legend_pct">
                      {Math.round((c.total / grandTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>

              {biggest && (
                <p className="ledger_insight">
                  Biggest plan: <strong>{biggest.name}</strong> takes{" "}
                  {Math.round(
                    (Math.max(amountOf(biggest), 0) / grandTotal) * 100
                  )}
                  % of the budget.
                </p>
              )}
            </>
          )}
        </section>

        {/* ---------- filters ---------- */}
        {budgets.length > 0 && (
          <section className="ledger_controls" aria-label="Filter budgets">
            <h3 className="ledger_controls_title">Filter budgets</h3>

            <div className="ledger_controls_grid">
              <div className="ledger_field">
                <span className="ledger_field_label">Search</span>
                <label className="ledger_search">
                  <SearchIcon fontSize="small" />
                  <span className="ledger_sr_only">Search budgets</span>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>

              <div className="ledger_field">
                <span className="ledger_field_label">Sort by</span>
                <label className="ledger_sort">
                  <span className="ledger_sr_only">Sort by</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="ledger_field">
              <span className="ledger_field_label">Category</span>
              <div className="ledger_chips" role="group" aria-label="Category">
                <button
                  type="button"
                  className={`ledger_chip${
                    activeCategory === "all" ? " is_active" : ""
                  }`}
                  aria-pressed={activeCategory === "all"}
                  onClick={() => setCategory("all")}
                >
                  All{" "}
                  <span className="ledger_chip_count">{budgets.length}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`ledger_chip${
                      activeCategory === c.name ? " is_active" : ""
                    }`}
                    aria-pressed={activeCategory === c.name}
                    onClick={() =>
                      setCategory(activeCategory === c.name ? "all" : c.name)
                    }
                  >
                    {c.name}{" "}
                    <span className="ledger_chip_count">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- entries ---------- */}
        <section className="ledger_entries" aria-label="Budget entries">
          {isFiltered && visible.length > 0 && (
            <p className="ledger_filter_note">
              Showing {visible.length} of {budgets.length} ·{" "}
              {fmt(visibleTotal)} PLN
              <button
                type="button"
                className="ledger_link_btn"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </p>
          )}

          {visible.length > 0 ? (
            visible.map((budget) => {
              const share =
                grandTotal > 0
                  ? (Math.max(amountOf(budget), 0) / grandTotal) * 100
                  : 0;
              const confirming = confirmId === budget.id;

              return (
                <article className="ledger_entry" key={budget.id}>
                  <span
                    className="ledger_entry_stripe"
                    style={getCardStyle(budget.category)}
                  />

                  <div className="ledger_entry_main">
                    <h3 className="ledger_entry_name">{budget.name}</h3>
                    <span
                      className="ledger_entry_category"
                      style={getCardStyle(budget.category)}
                    >
                      {budget.category}
                    </span>
                    <div
                      className="ledger_share"
                      role="img"
                      aria-label={`${Math.round(share)}% of the plan`}
                    >
                      <span
                        className="ledger_share_fill"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>

                  <div className="ledger_entry_figures">
                    <span className="ledger_entry_amount">
                      {budget.amount}{" "}
                      <span className="ledger_currency">PLN</span>
                    </span>
                    <span className="ledger_entry_pct">
                      {Math.round(share)}% of plan
                    </span>
                  </div>

                  <div className="ledger_entry_actions">
                    <button
                      type="button"
                      onClick={() => handleEditBudget(budget.id)}
                      className="ledger_icon_btn"
                      aria-label={`Edit ${budget.name}`}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBudget(budget.id)}
                      className={`ledger_icon_btn ledger_icon_btn--danger${
                        confirming ? " is_confirming" : ""
                      }`}
                      aria-label={
                        confirming
                          ? `Confirm removing ${budget.name}`
                          : `Remove ${budget.name}`
                      }
                    >
                      {confirming ? (
                        <span className="ledger_confirm_text">Delete?</span>
                      ) : (
                        <DeleteOutlineIcon fontSize="small" />
                      )}
                    </button>
                  </div>
                </article>
              );
            })
          ) : budgets.length === 0 ? (
            <div className="ledger_empty">
              <p>No budgets yet.</p>
              <p className="ledger_empty_sub">
                Add your first entry to start planning {currentMonth}.
              </p>
              <button
                type="button"
                onClick={handleAddNewPlan}
                className="ledger_primary_btn"
              >
                <AddIcon fontSize="small" />
                Add your first budget
              </button>
            </div>
          ) : (
            <div className="ledger_empty">
              <p>No budgets match your filters.</p>
              <button
                type="button"
                className="ledger_link_btn"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* ---------- archive ---------- */}
        <section className="ledger_archive">
          <div className="ledger_archive_text">
            <h4>Close the books</h4>
            <p>Archive this month's plan to start fresh next month.</p>
          </div>
          <ArchivePlanButton currentTotalAmount={totalAmount} />
        </section>
      </div>

      {/* floating add button, mobile only */}
      <button
        type="button"
        className="ledger_fab"
        onClick={handleAddNewPlan}
        aria-label="Add a new budget"
      >
        <AddIcon />
      </button>

      {isModalOpen && (
        <BudgetModal
          closeModal={() => setIsModalOpen(false)}
          addOrEditBudget={handleAddOrEditBudget}
          currentBudget={currentBudget}
        />
      )}
    </div>
  );
}

export default Planning;