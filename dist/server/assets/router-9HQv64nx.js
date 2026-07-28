import { createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
const Route$6 = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "Shelfie — Pantry & Grocery Manager"
      },
      {
        name: "description",
        content: "A simple, smart pantry tracker and shopping list with barcode scanning."
      },
      {
        name: "theme-color",
        content: "#f7f2e7"
      }
    ],
    links: [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$5 = () => import("./_app-B24ep6Kj.js");
const Route$5 = createFileRoute("/_app")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./_app.index-BWBw-YJn.js");
const Route$4 = createFileRoute("/_app/")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_app.shop-CZUF3i2c.js");
const Route$3 = createFileRoute("/_app/shop")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_app.pantry-77Hsxi41.js");
const Route$2 = createFileRoute("/_app/pantry")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_app.list-qWLsBFyP.js");
const Route$1 = createFileRoute("/_app/list")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_app.pantry._itemId-BXOEBOUX.js");
const Route = createFileRoute("/_app/pantry/$itemId")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const AppRoute = Route$5.update({
  id: "/_app",
  getParentRoute: () => Route$6
});
const AppIndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRoute
});
const AppShopRoute = Route$3.update({
  id: "/shop",
  path: "/shop",
  getParentRoute: () => AppRoute
});
const AppPantryRoute = Route$2.update({
  id: "/pantry",
  path: "/pantry",
  getParentRoute: () => AppRoute
});
const AppListRoute = Route$1.update({
  id: "/list",
  path: "/list",
  getParentRoute: () => AppRoute
});
const AppPantryItemIdRoute = Route.update({
  id: "/$itemId",
  path: "/$itemId",
  getParentRoute: () => AppPantryRoute
});
const AppPantryRouteChildren = {
  AppPantryItemIdRoute
};
const AppPantryRouteWithChildren = AppPantryRoute._addFileChildren(
  AppPantryRouteChildren
);
const AppRouteChildren = {
  AppListRoute,
  AppPantryRoute: AppPantryRouteWithChildren,
  AppShopRoute,
  AppIndexRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  AppRoute: AppRouteWithChildren
};
const routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  router as r
};
