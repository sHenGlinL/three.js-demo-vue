const routes = [
  {
    path: "/web",
    name: "web",
    component: () => import("@/views/web/index.vue"),
  }
]

export default routes