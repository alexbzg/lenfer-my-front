import Vue from 'vue'

import Modal from "../components/Modal.vue"

export default async function (title, message, cancel_button) {
  return new Promise((resolve, reject) => {
    const dialog = new Vue({
      methods: {
        closeHandler(fn, arg) {
          return function() {
            fn(arg);
            dialog.$destroy();
            dialog.$el.remove();
          };
        }
      },
      render(h) {
        return h(Modal, {
          props: {
            title,
            message,
			cancel_button
          },
          on: {
            confirm: this.closeHandler(resolve),
            cancel: this.closeHandler(reject, new Error('canceled'))
          }
        });
      }
    }).$mount();
    document.body.appendChild(dialog.$el);
  });
}
