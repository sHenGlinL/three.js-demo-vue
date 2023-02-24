import { RouterView } from "vue-router"

const routes = {
  path: "/house",
  name: "house",
  component: RouterView,
  children: [
    {
      path: "cubeHouse",
      name: "cubeHouse",
      component: () => import("@/views/house/cube-house.vue"),
    },
    {
      path: "sphereHouse",
      name: "sphereHouse",
      component: () => import("@/views/house/sphere-house.vue"),
    }
  ]
}

export default routes