import { jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo, useContext, createContext } from "react";
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
function expirationState(date) {
  if (!date) return { label: "No date", tone: "neutral", days: Number.POSITIVE_INFINITY };
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = /* @__PURE__ */ new Date(`${date}T00:00:00`);
  const days = Math.round((expiration.getTime() - today.getTime()) / 864e5);
  if (days < 0) return { label: "Expired", tone: "danger", days };
  if (days === 0) return { label: "Expires today", tone: "danger", days };
  if (days <= 3) return { label: `${days} day${days === 1 ? "" : "s"} left`, tone: "warning", days };
  return { label: dateFormatter.format(expiration), tone: "fresh", days };
}
const GroceryContext = createContext(null);
function GroceryProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addDestination, setAddDestination] = useState("pantry");
  const [completedSuggestions, setCompletedSuggestions] = useState(/* @__PURE__ */ new Set());
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load your groceries.");
      setItems(data.items ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your groceries.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadItems();
  }, [loadItems]);
  const pantry = useMemo(() => items.filter((item) => item.listType === "pantry"), [items]);
  const manualShopping = useMemo(
    () => items.filter((item) => item.listType === "shopping"),
    [items]
  );
  const suggestions = useMemo(() => {
    const existingNames = new Set(manualShopping.map((item) => item.name.toLowerCase()));
    return pantry.filter((item) => {
      const expiry = expirationState(item.expirationDate);
      return (item.quantity <= item.minimumQuantity || expiry.days < 0) && !existingNames.has(item.name.toLowerCase());
    }).map((item) => {
      const expiry = expirationState(item.expirationDate);
      return {
        key: `suggested-${item.id}`,
        name: item.name,
        reason: expiry.days < 0 ? "Expired in pantry" : item.quantity === 0 ? "Out of stock" : "Running low",
        pantryId: item.id,
        checked: completedSuggestions.has(`suggested-${item.id}`),
        suggested: true
      };
    });
  }, [completedSuggestions, manualShopping, pantry]);
  const expiring = useMemo(
    () => pantry.filter((item) => expirationState(item.expirationDate).days <= 3).sort((a, b) => expirationState(a.expirationDate).days - expirationState(b.expirationDate).days),
    [pantry]
  );
  const shoppingCount = manualShopping.filter((item) => !item.checked).length + suggestions.filter((item) => !item.checked).length;
  const updateItem = useCallback(async (id, changes) => {
    setItems((current) => {
      const previous = current;
      const next = current.map((item) => item.id === id ? { ...item, ...changes } : item);
      void (async () => {
        try {
          const response = await fetch(`/api/items/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes)
          });
          if (!response.ok) throw new Error("Update failed.");
        } catch {
          setItems(previous);
          setError("That change did not save. Please try again.");
        }
      })();
      return next;
    });
  }, []);
  const deleteItem = useCallback(async (id) => {
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed.");
    } catch {
      setItems(previous);
      setError("That item could not be removed.");
    }
  }, [items]);
  const addItem = useCallback(async (values) => {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    if (!response.ok || !data.item) throw new Error(data.error || "Could not add that item.");
    setItems((current) => [...current, data.item]);
  }, []);
  const toggleSuggestion = useCallback((key) => {
    setCompletedSuggestions((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);
  const openAdd = useCallback((destination) => {
    setAddDestination(destination);
    setAddOpen(true);
  }, []);
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const value = {
    items,
    loading,
    error,
    setError,
    pantry,
    manualShopping,
    suggestions,
    expiring,
    shoppingCount,
    completedSuggestions,
    toggleSuggestion,
    updateItem,
    deleteItem,
    addItem,
    addOpen,
    addDestination,
    openAdd,
    closeAdd
  };
  return /* @__PURE__ */ jsx(GroceryContext.Provider, { value, children });
}
function useGrocery() {
  const context = useContext(GroceryContext);
  if (!context) throw new Error("useGrocery must be used within a GroceryProvider");
  return context;
}
export {
  GroceryProvider as G,
  expirationState as e,
  useGrocery as u
};
