
import { createRouter, createWebHashHistory } from "vue-router";

const routeModuleList = [];
const modules = import.meta.globEager('./modules/*.js');
Object.keys(modules).forEach((modulePath) => {
  const mod = modules[modulePath].default
  const modList = Array.isArray(mod) ? mod : [mod]
  routeModuleList.push(...modList);
});
const constantRoutes = [
  {
    path: "/",
    name: "welcome",
    component: () => import("@/views/welcome/index.vue"),
  },
  ...routeModuleList
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
});

export default router;
