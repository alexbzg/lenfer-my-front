<template>
  <div id="app">
      <div id="top_menu">
        <a id="home_link" href="/"><img src="/images/logo_lk.png" title="Личный кабинет" /></a>
        <a href="#">Настройки</a>
      </div>

      <div id="device_list">
        <div id="device_list_title">Мои устройства</div>
        <span class="device_btn">Инкубатор #1</span><span class="device_btn">Таймер</span>
      </div>

      <device :device_id="8">
      </device>

  </div>
</template>

<script>

import Device from './components/Device/Index'
import './style.css'

export default {
  name: 'app',
  components: {Device}
}
</script>

<style>
</style>
