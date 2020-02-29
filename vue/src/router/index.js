import Vue from 'vue';
import VueRouter from 'vue-router';
import Index from '../views/Index';
import Banner from '../components/Banner';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'index',
        components: {
            default: Index,
            banner: Banner
        }
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router;
