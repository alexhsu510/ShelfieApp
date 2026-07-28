import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CircleCheck, ShoppingBasket } from "lucide-react";
import { a as ShopCheckRow } from "./shared-CIdL_h31.js";
import { u as useGrocery } from "./grocery-BKhhDQeZ.js";
import "react";
function ShopModePage() {
  const {
    manualShopping,
    suggestions,
    updateItem,
    toggleSuggestion
  } = useGrocery();
  const total = manualShopping.length + suggestions.length;
  const checked = manualShopping.filter((item) => item.checked).length + suggestions.filter((item) => item.checked).length;
  const progress = total ? Math.round(checked / total * 100) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "shop-mode", children: [
    /* @__PURE__ */ jsxs("div", { className: "shop-mode-top", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/list", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { size: 20 }),
        " Back"
      ] }),
      /* @__PURE__ */ jsx("span", { children: "Shopping mode" }),
      /* @__PURE__ */ jsxs("span", { children: [
        checked,
        "/",
        total
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "shop-progress", children: /* @__PURE__ */ jsx("span", { style: {
      width: `${progress}%`
    } }) }),
    /* @__PURE__ */ jsxs("div", { className: "shop-mode-heading", children: [
      /* @__PURE__ */ jsx("span", { className: "eyebrow", children: "Today’s run" }),
      /* @__PURE__ */ jsx("h1", { children: checked === total && total > 0 ? "Cart complete." : "Let’s fill the basket." }),
      /* @__PURE__ */ jsx("p", { children: "Big tap targets, no distractions." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "shop-checklist", children: [
      suggestions.map((item) => /* @__PURE__ */ jsx(ShopCheckRow, { name: item.name, note: item.reason, checked: item.checked, onToggle: () => toggleSuggestion(item.key) }, item.key)),
      manualShopping.map((item) => /* @__PURE__ */ jsx(ShopCheckRow, { name: item.name, note: `${item.quantity} ${item.unit}`, checked: item.checked, onToggle: () => void updateItem(item.id, {
        checked: !item.checked
      }) }, item.id)),
      total === 0 && /* @__PURE__ */ jsx(EmptyStateLink, {})
    ] }),
    total > 0 && checked === total && /* @__PURE__ */ jsxs("div", { className: "complete-card", children: [
      /* @__PURE__ */ jsx(CircleCheck, { size: 28 }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: "All done" }),
        /* @__PURE__ */ jsx("span", { children: "You got everything on the list." })
      ] })
    ] })
  ] });
}
function EmptyStateLink() {
  return /* @__PURE__ */ jsxs(Link, { to: "/list", className: "empty-state", children: [
    /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(ShoppingBasket, {}) }),
    /* @__PURE__ */ jsx("strong", { children: "Nothing to pick up" }),
    /* @__PURE__ */ jsx("p", { children: "Head back and add a few groceries first." })
  ] });
}
export {
  ShopModePage as component
};
