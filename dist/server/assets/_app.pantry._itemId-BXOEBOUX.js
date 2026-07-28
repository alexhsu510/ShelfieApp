import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock3, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { L as LoadingState, I as ItemAvatar } from "./shared-CIdL_h31.js";
import { u as useGrocery, e as expirationState } from "./grocery-BKhhDQeZ.js";
import { R as Route } from "./router-9HQv64nx.js";
function ItemDetail() {
  const {
    itemId
  } = Route.useParams();
  const {
    loading,
    pantry,
    updateItem,
    deleteItem
  } = useGrocery();
  const navigate = useNavigate();
  const [expirationDate, setExpirationDate] = useState(null);
  if (loading) return /* @__PURE__ */ jsx(LoadingState, {});
  const item = pantry.find((candidate) => candidate.id === Number(itemId));
  if (!item) {
    return /* @__PURE__ */ jsxs("section", { className: "panel full-panel", children: [
      /* @__PURE__ */ jsx("div", { className: "view-heading", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "eyebrow", children: "Pantry item" }),
        /* @__PURE__ */ jsx("h2", { children: "Item not found" }),
        /* @__PURE__ */ jsx("p", { children: "It may have already been removed." })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "item-details-form", children: /* @__PURE__ */ jsxs(Link, { className: "back-link", to: "/pantry", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { size: 16 }),
        " Back to pantry"
      ] }) })
    ] });
  }
  const status = expirationState(item.expirationDate);
  const currentExpiration = expirationDate ?? item.expirationDate ?? "";
  async function handleDelete() {
    await deleteItem(item.id);
    void navigate({
      to: "/pantry"
    });
  }
  return /* @__PURE__ */ jsxs("section", { className: "panel full-panel", children: [
    /* @__PURE__ */ jsx("div", { className: "view-heading", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("span", { className: "eyebrow", children: "Pantry item" }),
      /* @__PURE__ */ jsx("h2", { children: item.name }),
      /* @__PURE__ */ jsx("p", { children: item.barcode ? `Barcode ${item.barcode}` : "Pantry staple" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "item-details-form", children: [
      /* @__PURE__ */ jsxs(Link, { className: "back-link", to: "/pantry", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { size: 16 }),
        " Back to pantry"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "selected-product", children: [
        /* @__PURE__ */ jsx(ItemAvatar, { item }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: item.name }),
          /* @__PURE__ */ jsxs("span", { className: `status-text ${status.tone}`, children: [
            /* @__PURE__ */ jsx(Clock3, { size: 13 }),
            " ",
            status.label
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-grid", children: [
        /* @__PURE__ */ jsxs("label", { children: [
          "Quantity",
          /* @__PURE__ */ jsxs("div", { className: "quantity-control", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void updateItem(item.id, {
              quantity: Math.max(0, item.quantity - 1)
            }), "aria-label": `Reduce ${item.name}`, children: /* @__PURE__ */ jsx(Minus, { size: 14 }) }),
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("b", { children: item.quantity }),
              /* @__PURE__ */ jsx("small", { children: item.unit })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void updateItem(item.id, {
              quantity: item.quantity + 1
            }), "aria-label": `Add ${item.name}`, children: /* @__PURE__ */ jsx(Plus, { size: 14 }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Restock when at",
          /* @__PURE__ */ jsx("input", { type: "number", min: "0", value: item.minimumQuantity, onChange: (event) => void updateItem(item.id, {
            minimumQuantity: Math.max(0, Number(event.target.value))
          }) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Best by / expires",
          /* @__PURE__ */ jsx("input", { type: "date", value: currentExpiration, onChange: (event) => {
            setExpirationDate(event.target.value);
            void updateItem(item.id, {
              expirationDate: event.target.value || null
            });
          } })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Barcode",
          /* @__PURE__ */ jsx("input", { value: item.barcode ?? "", disabled: true, placeholder: "No barcode on file" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "primary-button wide save-button danger-button", type: "button", onClick: () => void handleDelete(), children: [
        /* @__PURE__ */ jsx(Trash2, { size: 18 }),
        " Remove from pantry"
      ] })
    ] })
  ] });
}
export {
  ItemDetail as component
};
