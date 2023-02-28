import { RouterView } from "vue-router"

const routes = {
  path: "/game",
  name: "game",
  component: RouterView,
  children: [
    {
      path: "football",
      name: "football",
      component: () => import("@/views/game/football/index.vue"),
    },
    {
      path: "guided",
      name: "guided",
      component: () => import("@/views/game/guided/index.vue"),
    }
  ]
}

export default routes