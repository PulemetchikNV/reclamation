import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    routes: [
        {
            path: '/',
            redirect: '/characters'
        },  
        {
            path: '/login',
            component: () => import('../views/Login/index.vue')
        },
        {
            path: '/register',
            component: () => import('../views/Register/index.vue')
        },
        {
            path: '/profile',
            component: () => import('../views/Profile/index.vue')
        },
        {
            path: '/scenario-group/:id',
            component: () => import('../views/Scenarios/index.vue')
        },
        {
            path: '/scenario-groups',
            component: () => import('../views/ScenarioGroups/index.vue')
        },
        {
            path: '/characters',
            component: () => import('../views/Characters/index.vue')
        },
        {
            path: '/character-creator',
            component: () => import('../views/CharacterCreator/index.vue')
        },
        {
            path: '/scenario/:scenarioId/counterparty/:id',
            component: () => import('../views/CounterParty/index.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            component: () => import('../views/NotFound/index.vue')
        }
    ],
    history: createWebHistory()
})

router.beforeEach((to, from, next) => {
    if (to.path === '/login' || to.path === '/register') {
        next()
    } else {
        const isAuthenticated = localStorage.getItem('accessToken')
        if (!isAuthenticated) {
            next({ path: '/login' })
        } else {
            next()
        }
    }
})

export default router;
