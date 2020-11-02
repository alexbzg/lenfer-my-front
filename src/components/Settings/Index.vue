<template>
  <div class="settings">

        <div class="settings_menu">
            <router-link to="/settings/profile/">Профиль</router-link>
            <router-link to="/settings/">Устройства</router-link>
        </div>

        <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'SettingsIndex',
  data () {
    return {}
  }
}
</script>

<style>
</style>
