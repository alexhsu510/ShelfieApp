import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Plus, ShoppingBasket, Sparkles, ListChecks } from "lucide-react";
import { L as LoadingState, b as ShoppingRow, E as EmptyState } from "./shared-CIdL_h31.js";
import { u as useGrocery } from "./grocery-BKhhDQeZ.js";
import "react";
function ShoppingListPage() {
  const {
    loading,
    manualShopping,
    suggestions,
    openAdd,
    updateItem,
    deleteItem
  } = useGrocery();
  if (loading) return /* @__PURE__ */ jsx(LoadingState, {});
  const active = manualShopping.filter((item) => !item.checked);
  const done = manualShopping.filter((item) => item.checked);
  return /* @__PURE__ */ jsxs("section", { className: "panel full-panel shopping-panel", children: [
    /* @__PURE__ */ jsxs("div", { className: "view-heading", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "eyebrow", children: "Smart shopping list" }),
        /* @__PURE__ */ jsx("h2", { children: "Buy only what you need" }),
        /* @__PURE__ */ jsx("p", { children: "Low and expired items appear here automatically." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "heading-actions", children: [
        /* @__PURE__ */ jsxs("button", { className: "secondary-button", type: "button", onClick: () => openAdd("shopping"), children: [
          /* @__PURE__ */ jsx(Plus, { size: 18 }),
          " Add item"
        ] }),
        /* @__PURE__ */ jsxs(Link, { className: "primary-button", to: "/shop", children: [
          /* @__PURE__ */ jsx(ShoppingBasket, { size: 18 }),
          " Start shopping"
        ] })
      ] })
    ] }),
    suggestions.length > 0 && /* @__PURE__ */ jsxs("div", { className: "suggestion-block", children: [
      /* @__PURE__ */ jsxs("div", { className: "suggestion-heading", children: [
        /* @__PURE__ */ jsx(Sparkles, { size: 16 }),
        /* @__PURE__ */ jsx("strong", { children: "Suggested from your pantry" })
      ] }),
      suggestions.map((item) => /* @__PURE__ */ jsxs("div", { className: "shopping-row", children: [
        /* @__PURE__ */ jsx("span", { className: "smart-dot", children: /* @__PURE__ */ jsx(Sparkles, { size: 14 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: item.name }),
          /* @__PURE__ */ jsx("small", { children: item.reason })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "auto-label", children: "Auto-added" })
      ] }, item.key))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "shopping-list", children: [
      active.map((item) => /* @__PURE__ */ jsx(ShoppingRow, { item, onToggle: (target) => void updateItem(target.id, {
        checked: !target.checked
      }), onDelete: (id) => void deleteItem(id) }, item.id)),
      active.length === 0 && suggestions.length === 0 && /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(ListChecks, {}), title: "Your list is clear", text: "Low pantry items and anything you add show up here.", onAction: () => openAdd("shopping") })
    ] }),
    done.length > 0 && /* @__PURE__ */ jsxs("div", { className: "done-block", children: [
      /* @__PURE__ */ jsx("span", { children: "Picked up" }),
      done.map((item) => /* @__PURE__ */ jsx(ShoppingRow, { item, onToggle: (target) => void updateItem(target.id, {
        checked: !target.checked
      }), onDelete: (id) => void deleteItem(id) }, item.id))
    ] })
  ] });
}
export {
  ShoppingListPage as component
};
