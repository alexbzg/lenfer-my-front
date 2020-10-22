<template>
    <modal @close="close_modal">
        <h3 slot="header">Регистрация устройства</h3>
        <div slot="body">
            Код устройства
            <input class="text" v-model="device_hash"/>
        </div>
        <div slot="footer">
            <button class="modal-default-button" @click="$emit('close', device_hash)"
                :disabled="!device_hash || device_hash.length < 4">
                OK
            </button>
            <button class="modal-default-button" @click="$emit('close', false)">
                Отмена
            </button>
        </div>
    </modal>
</template>

<script>

import Modal from '../Modal.vue'

export default {
  name: 'DeviceAdd',
  components: {Modal},
  data () {
    return {
      device_hash: null
    }
  },
  methods: {
    close_modal (result) {
      this.$emit('close', result ? this.device_hash : null)
    }
  }
}

</script>

