import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Refrigerator, PackageOpen, CalendarClock, CircleCheck, ShoppingBasket, Plus, Sparkles, ScanLine, ChevronRight } from "lucide-react";
import { L as LoadingState, S as SectionHeading, P as PantryRow, E as EmptyState, I as ItemAvatar } from "./shared-CIdL_h31.js";
import { u as useGrocery, e as expirationState } from "./grocery-BKhhDQeZ.js";
import "react";
function Overview() {
  const {
    loading,
    pantry,
    manualShopping,
    suggestions,
    expiring,
    shoppingCount,
    openAdd,
    updateItem,
    deleteItem
  } = useGrocery();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(WelcomeStrip, { pantryCount: pantry.length, expiringCount: expiring.length, shoppingCount, onScan: () => openAdd("pantry") }),
    loading ? /* @__PURE__ */ jsx(LoadingState, {}) : /* @__PURE__ */ jsxs("div", { className: "dashboard-grid", children: [
      /* @__PURE__ */ jsxs("section", { className: "panel pantry-panel", children: [
        /* @__PURE__ */ jsx(SectionHeading, { icon: /* @__PURE__ */ jsx(Refrigerator, { size: 18 }), title: "In your pantry", caption: `${pantry.length} items`, action: "See everything", actionTo: "/pantry" }),
        /* @__PURE__ */ jsxs("div", { className: "pantry-list", children: [
          pantry.slice(0, 5).map((item) => /* @__PURE__ */ jsx(PantryRow, { item, linkToDetail: true, onQuantity: (target, delta) => void updateItem(target.id, {
            quantity: Math.max(0, target.quantity + delta)
          }), onDelete: (id) => void deleteItem(id) }, item.id)),
          pantry.length === 0 && /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(PackageOpen, {}), title: "Your shelves are waiting", text: "Scan or add your first pantry item.", onAction: () => openAdd("pantry") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "side-stack", children: [
        /* @__PURE__ */ jsxs("section", { className: "panel attention-panel", children: [
          /* @__PURE__ */ jsx(SectionHeading, { icon: /* @__PURE__ */ jsx(CalendarClock, { size: 18 }), title: "Use these next", caption: "Waste less" }),
          /* @__PURE__ */ jsxs("div", { className: "attention-list", children: [
            expiring.slice(0, 3).map((item) => /* @__PURE__ */ jsx(AttentionRow, { item }, item.id)),
            expiring.length === 0 && /* @__PURE__ */ jsxs("p", { className: "quiet-note", children: [
              /* @__PURE__ */ jsx(CircleCheck, { size: 18 }),
              " Nothing urgent. Nicely managed."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "panel list-preview", children: [
          /* @__PURE__ */ jsx(SectionHeading, { icon: /* @__PURE__ */ jsx(ShoppingBasket, { size: 18 }), title: "Next shop", caption: `${manualShopping.filter((item) => !item.checked).length + suggestions.length} to pick up`, action: "Open list", actionTo: "/list" }),
          /* @__PURE__ */ jsxs("div", { className: "mini-list", children: [
            suggestions.slice(0, 2).map((item) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "mini-check" }),
              /* @__PURE__ */ jsx("span", { children: item.name }),
              /* @__PURE__ */ jsx("small", { children: item.reason })
            ] }, item.key)),
            manualShopping.filter((item) => !item.checked).slice(0, Math.max(1, 3 - suggestions.length)).map((item) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "mini-check" }),
              /* @__PURE__ */ jsx("span", { children: item.name }),
              /* @__PURE__ */ jsx("small", { children: "Added manually" })
            ] }, item.id))
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "secondary-button wide", type: "button", onClick: () => openAdd("shopping"), children: [
            /* @__PURE__ */ jsx(Plus, { size: 17 }),
            " Add to list"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function AttentionRow({
  item
}) {
  const status = expirationState(item.expirationDate);
  return /* @__PURE__ */ jsxs(Link, { className: "attention-item", to: "/pantry/$itemId", params: {
    itemId: String(item.id)
  }, children: [
    /* @__PURE__ */ jsx(ItemAvatar, { item }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("strong", { children: item.name }),
      /* @__PURE__ */ jsx("span", { className: `status-text ${status.tone}`, children: status.label })
    ] }),
    /* @__PURE__ */ jsx(ChevronRight, { size: 17 })
  ] });
}
function WelcomeStrip({
  pantryCount,
  expiringCount,
  shoppingCount,
  onScan
}) {
  return /* @__PURE__ */ jsxs("section", { className: "welcome-strip", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("span", { className: "eyebrow", children: [
        /* @__PURE__ */ jsx(Sparkles, { size: 14 }),
        " Your kitchen, in sync"
      ] }),
      /* @__PURE__ */ jsxs("h1", { children: [
        "Good food starts",
        /* @__PURE__ */ jsx("br", {}),
        "with a ",
        /* @__PURE__ */ jsx("em", { children: "clear shelf." })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Track what you have, rescue what’s expiring, and shop without the guesswork." }),
      /* @__PURE__ */ jsxs("button", { className: "primary-button hero-button", type: "button", onClick: onScan, children: [
        /* @__PURE__ */ jsx(ScanLine, { size: 19 }),
        " Scan a grocery"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hero-stats", "aria-label": "Grocery summary", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: pantryCount }),
        /* @__PURE__ */ jsx("span", { children: "items stocked" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: expiringCount }),
        /* @__PURE__ */ jsx("span", { children: "need attention" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: shoppingCount }),
        /* @__PURE__ */ jsx("span", { children: "on your list" })
      ] })
    ] })
  ] });
}
export {
  Overview as component
};
