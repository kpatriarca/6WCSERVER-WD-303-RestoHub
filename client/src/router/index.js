
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import RestaurantsView from '../views/RestaurantsView.vue'
import RestaurantDetailsView from '../views/RestaurantDetailsView.vue'
import AddRestaurantView from '../views/AddRestaurantView.vue'
import EditRestaurantView from '../views/EditRestaurantView.vue'
import AboutView from '../views/AboutView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/restaurants', name: 'restaurants', component: RestaurantsView },
  {
    path: '/restaurants/:id',
    name: 'restaurant-details',
    component: RestaurantDetailsView,
  },
  {
    path: '/add-restaurant',
    name: 'add-restaurant',
    component: AddRestaurantView,
  },
  {
    path: '/edit-restaurant/:id',
    name: 'edit-restaurant',
    component: EditRestaurantView,
  },
  { path: '/about', name: 'about', component: AboutView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
