import Vue from 'vue'
import App from './App.vue'
import * as VueGoogleMaps from "vue2-google-maps";
import * as L from 'vue2-leaflet'

Vue.config.productionTip = false

Vue.use(L)

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyB1hWtRazAMx4rQD-NVGygHVigtCyvBRm0",
    libraries: "places" // necessary for places input
  }
});

new Vue({
  render: h => h(App),
}).$mount('#app')
