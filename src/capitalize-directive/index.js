import Vue from 'vue'

export default function () {
  Vue.directive('capitalize', {
    bind (el, binding) {
      const transform = (value => binding.arg === 'lower' ? value.toLowerCase() : value.toUpperCase())
      const handler = function (e) {
        if (e.target.value && e.target.value !== transform(e.target.value)) {
          e.target.value = transform(e.target.value)
          e.target.dispatchEvent(new CustomEvent('input'))
        }
      }
      el.addEventListener('input', handler)
    }
  })
}
  
