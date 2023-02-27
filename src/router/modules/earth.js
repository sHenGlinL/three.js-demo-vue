import { RouterView } from "vue-router"

const routes = {
  path: "/earth",
  name: "earth",
  component: RouterView,
  children: [
    {
      path: "earth-1",
      name: "earth-1",
      component: () => import("@/views/earth/earth-1/index.vue"),
    },
    {
      path: "earth-2",
      name: "earth-2",
      component: () => import("@/views/earth/earth-2/index.vue"),
    },
  ]
}

export default routes