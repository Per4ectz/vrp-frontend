import Vue from 'vue'
import App from './App.vue'
import * as VueGoogleMaps from "vue2-google-maps";
import * as L from 'vue2-leaflet'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'

// import axios from 'axios'

Vue.config.productionTip = false

Vue.use(ElementUI, { locale })
Vue.use(BootstrapVue)
Vue.use(L)
// Vue.use(axios)

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyB1hWtRazAMx4rQD-NVGygHVigtCyvBRm0",
    libraries: "places" // necessary for places input
  }
});
new Vue({
  render: h => h(App),
}).$mount('#app')
