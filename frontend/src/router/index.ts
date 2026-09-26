import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/", component: () => import("../views/catalog/CatalogView.vue") },
  { path: "/products/:id", component: () => import("../views/catalog/ProductDetailView.vue") },
  { path: "/login", component: () => import("../views/auth/LoginView.vue") },
  { path: "/register", component: () => import("../views/auth/RegisterView.vue") },
  { path: "/forgot-password", component: () => import("../views/auth/ForgotPasswordView.vue") },
  { path: "/reset-password", component: () => import("../views/auth/ResetPasswordView.vue") },
  {
    path: "/cart",
    component: () => import("../views/cart/CartView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/checkout",
    component: () => import("../views/cart/CheckoutView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    component: () => import("../views/orders/OrderHistoryView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/products",
    component: () => import("../views/admin/AdminProductsView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/products/new",
    component: () => import("../views/admin/AdminProductFormView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/products/:id/edit",
    component: () => import("../views/admin/AdminProductFormView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/users",
    component: () => import("../views/admin/AdminUsersView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/reviews",
    component: () => import("../views/admin/AdminReviewsView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Bloquear el acceso a rutas privadas o de administrador sin la sesión correspondiente
router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return "/login";
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return "/";
  }
});