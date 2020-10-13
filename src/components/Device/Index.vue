<template>
  <div class="device_index">

      <h3>{{type}} {{title}}</h3>

      <sensor-chart v-for="id in sensors" :sensor_id="id" :key="id">
      </sensor-chart>
  </div>
</template>

<script>
import {get} from '../../api'

import SensorChart from './SensorChart'

export default {
  name: 'DeviceIndex',
  components: {SensorChart},
  props: ['device_id'],
  data () {
    return {
      sensors: null,
      type: null,
      title: null
    }
  },
  async mounted () {
    get('/api/device/' + this.device_id)
      .then(response => {
        this.sensors = response.data.sensors
        this.type = response.data.device_type
        this.title = response.data.title
      })
  }
}
</script>

<style>
</style>
