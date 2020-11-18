<template>
  <div class="settings_index">

        <div class="settings_menu">
            <router-link to="/settings/">Устройства</router-link>
            <router-link to="/settings/register_device">Добавить устройство</router-link>
            <router-link to="/settings/schedules">Шаблоны</router-link>
            <router-link to="/settings/profile/">Профиль</router-link>
        </div>

        <router-view @show-modal="show_modal"></router-view>
        <modal v-if="modal" @close="modal = null">
            <h3 slot="header">{{modal.header}}</h3>
            <div slot="body">{{modal.body}}</div>
        </modal>

  </div>
</template>

<script>

import Modal from '../Modal'

export default {
  name: 'SettingsIndex',
  components: {Modal},
  props: ['devices'],
  data () {
    return {
      modal: null
    }
  },
  methods: {
    show_modal(title, body) {
      this.modal = {
        title: title,
        body: body
      }
    }
  }
}
</script>

<style>
</style>
