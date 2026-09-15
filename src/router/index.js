import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
     
      component: () => import('../views/LoginPage.vue'),
    },
    {
      path: '/',
      component: () => import('../views/HomePage.vue'),
      redirect:'/NavList',
      children: [
        {
        path:"NavList",
        component: () => import('../views/Nav/NavList.vue'),
      },
      
    {
      path: 'user/Info',
   
      component: () => import('../views/user/UserInfo.vue'),
    },
  
    {
      path: 'user/Password',
      
      component: () => import('../views/user/UserPassword.vue'),
    },
   ]
    },
  
  ],
})

router.beforeEach((to) => {
  // 如果没有token, 且访问的是非登录页，拦截到登录，其他情况正常放行
  const useStore = useUserStore()
  if (!useStore.token && to.path !== '/login') return '/login'
})

export default router
