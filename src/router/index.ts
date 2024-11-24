import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  }
] as const

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.beforeEach((newRoute: RouteLocationNormalized, oldRoute: RouteLocationNormalized) => {
  /* return {name: _ROUTENAME_} // route to _ROUTENAME_ */
  /* return {path: _PATHNAME_} //route to _PATHNAME_ */
  /* return true // confirm routing */
  /* return false // disallow routing */
})

// Generate Types for Route-names and Route-paths
const route_paths = routes.map((m) => m.path)
type pathType = (typeof route_paths)[number]
const route_names = routes.map((m) => m.name)
type nameType = (typeof route_names)[number]

export default router
export type { pathType, nameType }
