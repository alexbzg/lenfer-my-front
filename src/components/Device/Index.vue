<template>
  <div class="device_index">

      <div class="controller_info">
        <span class="info_title">{{title ? title : type}}</span>
        <span class="info_data" v-for="(prop, idx) in props_titles" :key="idx">
            {{prop.title}} <span>{{props_display[idx]}}</span>
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
      <sensor-chart v-for="sensor in sensors" :sensor_id="sensor.id" :key="sensor.id">
      </sensor-chart>
  </div>
</template>

<script>
import {get} from '../../api'
import {userDataPost} from '../../store'
import {display_date} from '../../utils'

import SensorChart from './SensorChart'
import DeviceProps from './Props'
import Modal from '../Modal'

const PARAM_TITLES = {
  temperature: 'Teмпература',
  humidity: 'Влажность'
}

export default {
  PARAM_TITLES: PARAM_TITLES,
  name: 'DeviceIndex',
  components: {SensorChart, DeviceProps, Modal},
  props: ['device_id'],
  data () {
    return {
      sensors: null,
      type: null,
      title: null,
      edit_props: false,
      edit_props_response: false,
      props_titles: [],
      props_values: [],
      sensors_state: []
    }
  },
  async mounted () {
    get('/api/device/' + this.device_id)
      .then(response => {
        this.sensors = response.data.sensors
        this.type = response.data.device_type
        this.title = response.data.title
        this.props_titles = response.data.props_titles
        this.props_values = response.data.props_values
        this.sensors_state = response.data.sensors.filter(x => x.is_master)
      })
  },
  methods: {
    close_props (title, props) {
      this.edit_props = false
      if (title) {
          userDataPost('device',
            {id: this.device_id,
              title: title,
              props: props})
            .then(() => {
              this.title = title
              this.props_values = props
            })
            .catch(error => {
               this.edit_props_response = error.message
            })
      }

    }
  },
  computed: {
    props_display () {
      const r = []
      const length = this.props_titles.length
      for (let co = 0; co < length; co++) {
        if (this.props_titles[co].type === 'date') {
          r.push(display_date(new Date(this.props_values[co])))
        } else {
          r.push(this.props_values[co])
        }
      }
      return r
    }
  }

}
</script>

<style>
</style>
