import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useLocation, Outlet, Link } from "@tanstack/react-router";
import { X, Search, Camera, Barcode, LoaderCircle, ChevronRight, ArrowLeft, Plus, PackageOpen, AlertTriangle, ScanLine, Leaf, Refrigerator, ListChecks } from "lucide-react";
import { G as GroceryProvider, u as useGrocery } from "./grocery-BKhhDQeZ.js";
import { useState, useRef, useEffect } from "react";
function AddItemModal({ destination, onClose, onAdded }) {
  const [mode, setMode] = useState("search");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [minimumQuantity, setMinimumQuantity] = useState(1);
  const [unit, setUnit] = useState("item");
  const [expirationDate, setExpirationDate] = useState("");
  async function searchProducts(searchQuery = query) {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;
    setSearching(true);
    setMessage("");
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(cleanQuery)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      const results = data.products ?? [];
      setProducts(results);
      if (/^\d{8,14}$/.test(cleanQuery) && results[0]) setSelected(results[0]);
      if (results.length === 0) setMessage("No match found. You can still add it as a custom item.");
    } catch (searchError) {
      setMessage(searchError instanceof Error ? searchError.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }
  async function saveItem() {
    const name = selected?.name || query.trim();
    if (!name) return setMessage("Enter or choose a product first.");
    if (destination === "pantry" && !expirationDate) return setMessage("Add an expiration or best-by date.");
    setSaving(true);
    setMessage("");
    try {
      await onAdded({
        name,
        barcode: selected?.barcode || null,
        imageUrl: selected?.imageUrl || null,
        listType: destination,
        quantity,
        minimumQuantity,
        unit,
        expirationDate: destination === "pantry" ? expirationDate : null,
        source: selected ? "open-food-facts" : "manual"
      });
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : "Could not add that item.");
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "modal-backdrop", role: "presentation", onMouseDown: (event) => {
    if (event.currentTarget === event.target) onClose();
  }, children: /* @__PURE__ */ jsxs("div", { className: "modal-card", role: "dialog", "aria-modal": "true", "aria-labelledby": "add-item-title", children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "eyebrow", children: destination === "pantry" ? "Stock the shelf" : "Plan the next shop" }),
        /* @__PURE__ */ jsx("h2", { id: "add-item-title", children: "Add a grocery" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "icon-button", type: "button", onClick: onClose, "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
    ] }),
    !selected ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "mode-tabs", children: [
        /* @__PURE__ */ jsxs("button", { className: mode === "search" ? "active" : "", type: "button", onClick: () => setMode("search"), children: [
          /* @__PURE__ */ jsx(Search, { size: 17 }),
          " Search"
        ] }),
        /* @__PURE__ */ jsxs("button", { className: mode === "scan" ? "active" : "", type: "button", onClick: () => setMode("scan"), children: [
          /* @__PURE__ */ jsx(Camera, { size: 17 }),
          " Camera scan"
        ] })
      ] }),
      mode === "scan" ? /* @__PURE__ */ jsx(CameraScanner, { onCode: (code) => {
        setQuery(code);
        void searchProducts(code);
      }, onFallback: () => setMode("search") }) : /* @__PURE__ */ jsxs("div", { className: "product-search", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "product-query", children: "Product name or barcode" }),
        /* @__PURE__ */ jsxs("div", { className: "search-field", children: [
          /* @__PURE__ */ jsx(Barcode, { size: 19 }),
          /* @__PURE__ */ jsx("input", { id: "product-query", autoFocus: true, value: query, onChange: (event) => setQuery(event.target.value), onKeyDown: (event) => {
            if (event.key === "Enter") void searchProducts();
          }, placeholder: "Try “oat milk” or scan a code" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void searchProducts(), disabled: searching, children: searching ? /* @__PURE__ */ jsx(LoaderCircle, { className: "spin", size: 18 }) : "Find" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "field-hint", children: "Product details come from Open Food Facts." }),
        message && /* @__PURE__ */ jsx("p", { className: "inline-message", children: message }),
        /* @__PURE__ */ jsx("div", { className: "product-results", children: products.map((product) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setSelected(product), children: [
          /* @__PURE__ */ jsx(ProductImage, { product }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: product.name }),
            /* @__PURE__ */ jsx("small", { children: [product.brand, product.packageSize].filter(Boolean).join(" · ") || "Product match" })
          ] }),
          /* @__PURE__ */ jsx(ChevronRight, { size: 18 })
        ] }, `${product.barcode}-${product.name}`)) }),
        query.trim() && products.length === 0 && !searching && /* @__PURE__ */ jsxs("button", { className: "secondary-button wide", type: "button", onClick: () => setSelected({ barcode: "", name: query.trim(), brand: "", imageUrl: "", packageSize: "" }), children: [
          "Use “",
          query.trim(),
          "”"
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "item-details-form", children: [
      /* @__PURE__ */ jsxs("button", { className: "back-link", type: "button", onClick: () => setSelected(null), children: [
        /* @__PURE__ */ jsx(ArrowLeft, { size: 16 }),
        " Choose another product"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "selected-product", children: [
        /* @__PURE__ */ jsx(ProductImage, { product: selected }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: selected.name }),
          /* @__PURE__ */ jsxs("span", { children: [
            selected.brand || "Custom grocery",
            selected.packageSize ? ` · ${selected.packageSize}` : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-grid", children: [
        /* @__PURE__ */ jsxs("label", { children: [
          "Quantity",
          /* @__PURE__ */ jsx("input", { type: "number", min: "0", value: quantity, onChange: (event) => setQuantity(Math.max(0, Number(event.target.value))) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Unit",
          /* @__PURE__ */ jsxs("select", { value: unit, onChange: (event) => setUnit(event.target.value), children: [
            /* @__PURE__ */ jsx("option", { children: "item" }),
            /* @__PURE__ */ jsx("option", { children: "bag" }),
            /* @__PURE__ */ jsx("option", { children: "box" }),
            /* @__PURE__ */ jsx("option", { children: "carton" }),
            /* @__PURE__ */ jsx("option", { children: "bottle" }),
            /* @__PURE__ */ jsx("option", { children: "can" }),
            /* @__PURE__ */ jsx("option", { children: "jar" }),
            /* @__PURE__ */ jsx("option", { children: "loaf" })
          ] })
        ] }),
        destination === "pantry" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("label", { children: [
            "Restock when at",
            /* @__PURE__ */ jsx("input", { type: "number", min: "0", value: minimumQuantity, onChange: (event) => setMinimumQuantity(Math.max(0, Number(event.target.value))) })
          ] }),
          /* @__PURE__ */ jsxs("label", { children: [
            "Best by / expires",
            /* @__PURE__ */ jsx("input", { type: "date", value: expirationDate, onChange: (event) => setExpirationDate(event.target.value) })
          ] })
        ] })
      ] }),
      message && /* @__PURE__ */ jsx("p", { className: "inline-message", children: message }),
      /* @__PURE__ */ jsxs("button", { className: "primary-button wide save-button", type: "button", onClick: () => void saveItem(), disabled: saving, children: [
        saving ? /* @__PURE__ */ jsx(LoaderCircle, { className: "spin", size: 18 }) : /* @__PURE__ */ jsx(Plus, { size: 18 }),
        " Add to ",
        destination
      ] })
    ] })
  ] }) });
}
function CameraScanner({ onCode, onFallback }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("Starting camera…");
  const [manualCode, setManualCode] = useState("");
  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const BarcodeDetectorClass = window.BarcodeDetector;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia || !BarcodeDetectorClass) {
        setStatus("Live barcode detection is not supported on this browser. Enter the barcode below instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (cancelled) return stream.getTracks().forEach((track) => track.stop());
        streamRef.current = stream;
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("Hold the barcode inside the frame");
        const detector = new BarcodeDetectorClass({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
        const detect = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              navigator.vibrate?.(80);
              onCode(codes[0].rawValue);
              return;
            }
          } catch {
            setStatus("Keep the barcode steady and well lit");
          }
          frame = window.requestAnimationFrame(detect);
        };
        frame = window.requestAnimationFrame(detect);
      } catch {
        setStatus("Camera access was unavailable. Enter the barcode below instead.");
      }
    }
    void start();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [onCode]);
  return /* @__PURE__ */ jsxs("div", { className: "scanner-wrap", children: [
    /* @__PURE__ */ jsxs("div", { className: "camera-stage", children: [
      /* @__PURE__ */ jsx("video", { ref: videoRef, muted: true, playsInline: true }),
      /* @__PURE__ */ jsxs("div", { className: "scan-frame", children: [
        /* @__PURE__ */ jsx("span", {}),
        /* @__PURE__ */ jsx("span", {}),
        /* @__PURE__ */ jsx("span", {}),
        /* @__PURE__ */ jsx("span", {})
      ] }),
      /* @__PURE__ */ jsx("div", { className: "scan-line" })
    ] }),
    /* @__PURE__ */ jsx("p", { children: status }),
    /* @__PURE__ */ jsxs("div", { className: "manual-barcode", children: [
      /* @__PURE__ */ jsx("input", { inputMode: "numeric", value: manualCode, onChange: (event) => setManualCode(event.target.value), placeholder: "Enter barcode number" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => manualCode.trim() && onCode(manualCode.trim()), children: "Look up" })
    ] }),
    /* @__PURE__ */ jsxs("button", { className: "text-button", type: "button", onClick: onFallback, children: [
      /* @__PURE__ */ jsx(Search, { size: 16 }),
      " Search by product name instead"
    ] })
  ] });
}
function ProductImage({ product }) {
  return /* @__PURE__ */ jsx("div", { className: "product-image", children: product.imageUrl ? /* @__PURE__ */ jsx("img", { src: product.imageUrl, alt: "" }) : /* @__PURE__ */ jsx(PackageOpen, { size: 22 }) });
}
function AppLayout() {
  return /* @__PURE__ */ jsx(GroceryProvider, { children: /* @__PURE__ */ jsx(AppShell, {}) });
}
function AppShell() {
  const {
    error,
    setError,
    addOpen,
    addDestination,
    openAdd,
    closeAdd,
    addItem
  } = useGrocery();
  const location = useLocation();
  const onShoppingList = location.pathname === "/list";
  const onShop = location.pathname === "/shop";
  return /* @__PURE__ */ jsxs("div", { className: "app-shell", children: [
    /* @__PURE__ */ jsx("div", { className: "ambient ambient-one" }),
    /* @__PURE__ */ jsx("div", { className: "ambient ambient-two" }),
    /* @__PURE__ */ jsx(Header, { onAdd: () => openAdd("pantry") }),
    /* @__PURE__ */ jsxs("main", { className: "page-wrap", children: [
      error && /* @__PURE__ */ jsxs("div", { className: "error-banner", role: "alert", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 18 }),
        /* @__PURE__ */ jsx("span", { children: error }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setError(""), "aria-label": "Dismiss error", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsx(Outlet, {})
    ] }),
    !onShop && /* @__PURE__ */ jsxs("button", { className: "scan-fab", type: "button", onClick: () => openAdd(onShoppingList ? "shopping" : "pantry"), children: [
      /* @__PURE__ */ jsx(ScanLine, { size: 21 }),
      /* @__PURE__ */ jsx("span", { children: "Scan item" })
    ] }),
    addOpen && /* @__PURE__ */ jsx(AddItemModal, { destination: addDestination, onClose: closeAdd, onAdded: async (values) => {
      await addItem(values);
      closeAdd();
    } })
  ] });
}
function Header({
  onAdd
}) {
  return /* @__PURE__ */ jsxs("header", { className: "topbar", children: [
    /* @__PURE__ */ jsxs("div", { className: "topbar-inner", children: [
      /* @__PURE__ */ jsxs(Link, { className: "brand", to: "/", children: [
        /* @__PURE__ */ jsx("span", { className: "brand-mark", children: /* @__PURE__ */ jsx(Leaf, { size: 23, strokeWidth: 2.4 }) }),
        /* @__PURE__ */ jsx("span", { children: "Shelfie" })
      ] }),
      /* @__PURE__ */ jsxs("nav", { className: "desktop-nav", "aria-label": "Main navigation", children: [
        /* @__PURE__ */ jsx(NavButton, { to: "/", label: "Overview" }),
        /* @__PURE__ */ jsx(NavButton, { to: "/pantry", label: "My pantry" }),
        /* @__PURE__ */ jsx(NavButton, { to: "/list", label: "Shopping list", showCount: true })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "primary-button compact", type: "button", onClick: onAdd, children: [
        /* @__PURE__ */ jsx(Plus, { size: 17 }),
        " Add item"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "mobile-nav", "aria-label": "Mobile navigation", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", activeProps: {
        className: "active"
      }, activeOptions: {
        exact: true
      }, children: [
        /* @__PURE__ */ jsx(Leaf, { size: 18 }),
        "Home"
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/pantry", activeProps: {
        className: "active"
      }, children: [
        /* @__PURE__ */ jsx(Refrigerator, { size: 18 }),
        "Pantry"
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/list", activeProps: {
        className: "active"
      }, children: [
        /* @__PURE__ */ jsx(ListChecks, { size: 18 }),
        "List"
      ] })
    ] })
  ] });
}
function NavButton({
  to,
  label,
  showCount
}) {
  const {
    shoppingCount
  } = useGrocery();
  return /* @__PURE__ */ jsxs(Link, { to, activeProps: {
    className: "active"
  }, activeOptions: {
    exact: to === "/"
  }, children: [
    label,
    showCount && shoppingCount > 0 && /* @__PURE__ */ jsx("span", { className: "nav-count", children: shoppingCount })
  ] });
}
export {
  AppLayout as component
};
