<template>
  <div id="app">
      <div id="lk_top_menu">
        <a id="lk_home_link" href="/"><img src="/images/logo_lk.png" title="Личный кабинет" /></a>
        <a id="lk_setup_link" href="#">Настройки</a>
        <div id="device_list">
          <span class="device_btn">Инкубатор #1</span><span class="device_btn">Таймер</span>
        </div>
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
