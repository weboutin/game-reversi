import Vue from 'vue'

Vue.config.productionTip = false
Vue.use(require('vue-cookies'))

Vue.prototype.$toast = {
  show: function (message) {
    const toastConstructor = Vue.extend(toast)
    const instance = new toastConstructor({
      propsData: {
        message
      }
    }).$mount()
    document.body.appendChild(instance.$el)
    setTimeout(()=>{
      document.body.removeChild(instance.$el)
    }, 3000)
  }
}
Vue.prototype.$serverMsg = {
  instance: null,
  show: function (message) {
    const toastConstructor = Vue.extend(toast)
    this.instance = new toastConstructor({
      propsData: {
        message
      }
    }).$mount()
    document.body.appendChild(this.instance.$el)
  },
  hide: function() {
    document.body.removeChild(this.instance.$el)
  }
}

Vue.prototype.$storagekey = 'reverrsiUser'

import App from './App.vue'
import toast from './components/common/toast'

new Vue({
  render: h => h(App),
}).$mount('#app')

