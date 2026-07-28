import { jsx, jsxs } from "react/jsx-runtime";
import { Plus, Search, PackageOpen } from "lucide-react";
import { useState } from "react";
import { L as LoadingState, P as PantryRow, E as EmptyState } from "./shared-CIdL_h31.js";
import { u as useGrocery } from "./grocery-BKhhDQeZ.js";
import "@tanstack/react-router";
function PantryPage() {
  const {
    loading,
    pantry,
    openAdd,
    updateItem,
    deleteItem
  } = useGrocery();
  const [query, setQuery] = useState("");
  if (loading) return /* @__PURE__ */ jsx(LoadingState, {});
  const filtered = pantry.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  return /* @__PURE__ */ jsxs("section", { className: "panel full-panel", children: [
    /* @__PURE__ */ jsxs("div", { className: "view-heading", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "eyebrow", children: "Pantry tracker" }),
        /* @__PURE__ */ jsx("h2", { children: "Everything on the shelf" }),
        /* @__PURE__ */ jsx("p", { children: "Quantities and dates at a glance." })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "primary-button", type: "button", onClick: () => openAdd("pantry"), children: [
        /* @__PURE__ */ jsx(Plus, { size: 18 }),
        " Add pantry item"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "search-field inline-search", children: [
      /* @__PURE__ */ jsx(Search, { size: 18 }),
      /* @__PURE__ */ jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Filter your pantry" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pantry-list roomy", children: [
      filtered.map((item) => /* @__PURE__ */ jsx(PantryRow, { item, linkToDetail: true, onQuantity: (target, delta) => void updateItem(target.id, {
        quantity: Math.max(0, target.quantity + delta)
      }), onDelete: (id) => void deleteItem(id) }, item.id)),
      filtered.length === 0 && /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(PackageOpen, {}), title: "No matching groceries", text: "Try a different search or add something new.", onAction: () => openAdd("pantry") })
    ] })
  ] });
}
export {
  PantryPage as component
};
