import Vue from 'vue'

export default function () {
  Vue.directive('capitalize', {
    bind (el) {
      const handler = function (e) {
        if (e.target.value && e.target.value !== e.target.value.toUpperCase()) {
          e.target.value = e.target.value.toUpperCase()
          e.target.dispatchEvent(new CustomEvent('input'))
        }
      }
      el.addEventListener('input', handler)
    }
  })
}
  
