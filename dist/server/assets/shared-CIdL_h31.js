import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { RotateCcw, ChevronRight, Clock3, Minus, Plus, Trash2, Check } from "lucide-react";
import { e as expirationState } from "./grocery-BKhhDQeZ.js";
function SectionHeading({ icon, title, caption, action, actionTo, onAction }) {
  return /* @__PURE__ */ jsxs("div", { className: "section-heading", children: [
    /* @__PURE__ */ jsx("div", { className: "section-title-icon", children: icon }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { children: title }),
      /* @__PURE__ */ jsx("span", { children: caption })
    ] }),
    action && actionTo && /* @__PURE__ */ jsxs(Link, { to: actionTo, children: [
      action,
      /* @__PURE__ */ jsx(ChevronRight, { size: 15 })
    ] }),
    action && !actionTo && /* @__PURE__ */ jsxs("button", { type: "button", onClick: onAction, children: [
      action,
      /* @__PURE__ */ jsx(ChevronRight, { size: 15 })
    ] })
  ] });
}
function ItemAvatar({ item }) {
  return /* @__PURE__ */ jsx("div", { className: "item-avatar", children: item.imageUrl ? /* @__PURE__ */ jsx("img", { src: item.imageUrl, alt: "" }) : /* @__PURE__ */ jsx("span", { children: item.name.slice(0, 1).toUpperCase() }) });
}
function EmptyState({ icon, title, text, onAction }) {
  return /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
    /* @__PURE__ */ jsx("span", { children: icon }),
    /* @__PURE__ */ jsx("strong", { children: title }),
    /* @__PURE__ */ jsx("p", { children: text }),
    /* @__PURE__ */ jsxs("button", { className: "text-button", type: "button", onClick: onAction, children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " Add something"
    ] })
  ] });
}
function LoadingState() {
  return /* @__PURE__ */ jsxs("div", { className: "loading-layout", children: [
    /* @__PURE__ */ jsx("div", { className: "skeleton hero-skeleton" }),
    /* @__PURE__ */ jsxs("div", { className: "dashboard-grid", children: [
      /* @__PURE__ */ jsx("div", { className: "skeleton panel-skeleton" }),
      /* @__PURE__ */ jsxs("div", { className: "side-stack", children: [
        /* @__PURE__ */ jsx("div", { className: "skeleton small-skeleton" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton small-skeleton" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "loading-caption", children: [
      /* @__PURE__ */ jsx(RotateCcw, { className: "spin", size: 16 }),
      " Checking your shelves…"
    ] })
  ] });
}
function PantryRow({ item, onQuantity, onDelete, linkToDetail }) {
  const status = expirationState(item.expirationDate);
  const main = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(ItemAvatar, { item }),
    /* @__PURE__ */ jsxs("div", { className: "item-main", children: [
      /* @__PURE__ */ jsx("strong", { children: item.name }),
      /* @__PURE__ */ jsx("span", { children: item.barcode ? `Barcode ${item.barcode}` : "Pantry staple" })
    ] })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "pantry-row", children: [
    linkToDetail ? /* @__PURE__ */ jsx(Link, { className: "pantry-row-link", to: "/pantry/$itemId", params: { itemId: String(item.id) }, children: main }) : main,
    /* @__PURE__ */ jsxs("div", { className: `date-pill ${status.tone}`, children: [
      /* @__PURE__ */ jsx(Clock3, { size: 14 }),
      /* @__PURE__ */ jsx("span", { children: status.label })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "quantity-control", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onQuantity(item, -1), "aria-label": `Reduce ${item.name}`, children: /* @__PURE__ */ jsx(Minus, { size: 14 }) }),
      /* @__PURE__ */ jsxs("span", { children: [
        /* @__PURE__ */ jsx("b", { children: item.quantity }),
        /* @__PURE__ */ jsx("small", { children: item.unit })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onQuantity(item, 1), "aria-label": `Add ${item.name}`, children: /* @__PURE__ */ jsx(Plus, { size: 14 }) })
    ] }),
    /* @__PURE__ */ jsx("button", { className: "icon-button delete-button", type: "button", onClick: () => onDelete(item.id), "aria-label": `Delete ${item.name}`, children: /* @__PURE__ */ jsx(Trash2, { size: 16 }) })
  ] });
}
function ShoppingRow({ item, onToggle, onDelete }) {
  return /* @__PURE__ */ jsxs("div", { className: `shopping-row ${item.checked ? "checked" : ""}`, children: [
    /* @__PURE__ */ jsx("button", { className: "list-checkbox", type: "button", onClick: () => onToggle(item), "aria-label": `Mark ${item.name} ${item.checked ? "not done" : "done"}`, children: item.checked && /* @__PURE__ */ jsx(Check, { size: 16 }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("strong", { children: item.name }),
      /* @__PURE__ */ jsxs("small", { children: [
        item.quantity,
        " ",
        item.unit,
        item.quantity === 1 ? "" : "s"
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { className: "icon-button delete-button", type: "button", onClick: () => onDelete(item.id), "aria-label": `Delete ${item.name}`, children: /* @__PURE__ */ jsx(Trash2, { size: 16 }) })
  ] });
}
function ShopCheckRow({ name, note, checked, onToggle }) {
  return /* @__PURE__ */ jsxs("button", { className: `shop-check-row ${checked ? "checked" : ""}`, type: "button", onClick: onToggle, children: [
    /* @__PURE__ */ jsx("span", { className: "large-check", children: checked && /* @__PURE__ */ jsx(Check, { size: 24 }) }),
    /* @__PURE__ */ jsxs("span", { children: [
      /* @__PURE__ */ jsx("strong", { children: name }),
      /* @__PURE__ */ jsx("small", { children: note })
    ] })
  ] });
}
export {
  EmptyState as E,
  ItemAvatar as I,
  LoadingState as L,
  PantryRow as P,
  SectionHeading as S,
  ShopCheckRow as a,
  ShoppingRow as b
};
