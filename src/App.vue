<template>
  <div id="app">
      <device :device_id="8">
      </device>
  </div>
</template>

<script>

import Device from './components/Device/Index'

export default {
  name: 'app',
  components: {Device}
}
</script>

<style>
</style>
