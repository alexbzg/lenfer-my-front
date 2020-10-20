<template>
  <div class="device_index">

      <div class="controller_info">
        <span class="info_title">{{type}} {{title}}</span>
        <span class="info_data">Дата вывода <span>27 июня 2020</span></span>
        <span class="info_data">Дата заселения <span>1 июля 2020</span></span>
        <span class="info_data">Птица <span>Бройлеры</span></span>
      </div>

      <table class="controller_table">
        <tr>
          <td class="top">таблица работы</td>
          <td class="top">День содержания</td>
          <td class="top">Температура</td>
          <td class="top">Влажность</td>
          <td class="top">Качество воздуха</td>
          <td class="top">Освещение</td>
          <td class="top">Время кормления</td>
        </tr>
        <tr>
          <td>Шаблон #1</td>
          <td>5</td>
          <td>36.6</td>
          <td>75</td>
          <td>-</td>
          <td></td>
          <td></td>
        </tr>
      </table>

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
