<template>
  <div class="settings_index">

        <div class="settings_menu">
            <router-link to="/settings/">Устройства</router-link>
            <router-link to="/settings/schedules">Таблицы</router-link>
            <router-link to="/settings/profile/">Профиль</router-link>
        </div>

        <router-view></router-view>

  </div>
</template>

<script>

export default {
  name: 'SettingsIndex',
  data () {
    return {
    }
  }
}
</script>

<style>
</style>
