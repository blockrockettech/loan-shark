import notify from './notify';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import vSelect from 'vue-select';
import apolloProvider from './apollo';

Vue.use(BootstrapVue);
Vue.component('v-select', vSelect);

export {
    notify,
    apolloProvider
};
