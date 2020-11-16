<template>
  <div class="settings_index">

        <div class="settings_menu">
            <router-link to="/settings/">Устройства</router-link>
            <router-link to="/settings/register_device">Добавить устройство</router-link>
            <router-link to="/settings/profile/">Профиль</router-link>
        </div>

        <router-view :devices="devices"></router-view>
  </div>
</template>

<script>

export default {
  name: 'SettingsIndex',
  props: ['devices'],
  data () {
    return {}
  }
}
</script>

<style>
</style>
