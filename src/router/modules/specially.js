import { RouterView } from "vue-router"

const routes = {
  path: "/specially",
  name: "specially",
  component: RouterView,
  children: [
    {
      path: "text",
      name: "text",
      component: () => import("@/views/specially/text/index.vue"),
    },
    {
      path: "points",
      name: "points",
      component: () => import("@/views/specially/points/index.vue"),
    }
  ]
}

export default routes