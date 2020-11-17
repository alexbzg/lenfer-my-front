<template>
  <div class="device_index">

      <div class="controller_info">
        <span class="info_title">{{device.title ? device.title : device.type}}</span><br/>
        <span class="info_data" v-for="(prop, idx) in device.props_titles" :key="idx">
            {{prop.title}} <span>{{device.props_display[idx]}}</span>
        </span>
      </div>
<!--
      <table class="controller_table">
        <tr>
          <td class="top">таблица работы</td>
          <td class="top">День содержания</td>
          <td class="top" v-for="entry in sensors_state" :key="entry.type">
              {{$options.PARAM_TITLES[entry.type]}}
          </td>
          <td class="top">Освещение</td>
          <td class="top">Время кормления</td>
        </tr>
        <tr>
          <td>Шаблон #1</td>
          <td>5</td>
          <td  v-for="entry in sensors_state" :key="entry.type">{{entry.value}}</td>
          <td></td>
          <td></td>
        </tr>
      </table>
-->
        <div v-for="sensors_param in sensors_charts" :key="sensors_param.id" class="sensor_data_chart">
            <h4>{{sensors_param.title}}</h4>
            <sensor-chart :sensors="sensors_param.sensors">
            </sensor-chart>
        </div>
  </div>
</template>

<script>
import load_device from '../../device'
import {SENSORS_PARAMS} from '../../definitions'

import SensorChart from './SensorChart'

export default {
  name: 'DeviceIndex',
  components: {SensorChart},
  props: ['device_id'],
  data () {
    return {
      device: {},
      sensors_charts: []
    }
  },
  async mounted () {
    this.load_device()
  },
  methods: {
    async load_device () {
      this.device = {}
      this.sensors_charts = []
      load_device(this.device_id)
        .then(device => {
          this.device = device
          this.sensors_charts = []
          const sp_length = SENSORS_PARAMS.length
          for (let co = 0; co < sp_length; co++) {
            if (SENSORS_PARAMS[co].id in this.device.sensors_params) {
              this.sensors_charts.push({
                ...SENSORS_PARAMS[co],
                sensors: this.device.sensors_params[SENSORS_PARAMS[co].id].sensors
              })
            }
          }
        })
    }
  },
  watch: {
    device_id () {
      this.load_device()
    }
  }

}
</script>

<style>
</style>
