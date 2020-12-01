<template>
  <div class="device_index" v-if="device">

        <div class="controller_info">
            <span class="info_title">{{device.title ? device.title : device.type}}</span>
        </div>


        <table class="controller_table">
            <tr id="header">
                <th v-for="param in sensors_charts" :key="param.id" class="parameter">
                    {{param.title}}
                </th>
                <th class="schedule_day">День</th>
                <th id="schedule">Таблица работы</th>
            </tr>
            <tr>
                <td v-for="param in sensors_charts" :key="param.id" class="parameter">
                    <span class="current_data" >
                        {{param.value}}<template v-if="param.unit">{{param.unit}}</template>
                    </span>
                    <span class="schedule_data">
                      <template
                          v-if="schedule &&
                          schedule.today.params"> {{schedule.today.params[param.id].value}}<template
                              v-if="param.unit">{{param.unit}}</template>
                      </template>
                      <template v-if="!schedule || !schedule.today.params"></template>
                    </span>
                    <br/><span class="current_time" :class="{timeout: param.timeout}">{{param.tstamp}}</span>
                </td>
                <td class="schedule_day">
                    <template v-if="schedule">{{schedule.today.day_no}}</template>
                </td>
                <td id="schedule">
                    <router-link :to="'/settings/schedules/' + device.schedule_id" v-if="schedule">
                        {{schedule.title}}
                    </router-link>
                </td>
            </tr>
        </table>

        <div v-for="sensors_param in sensors_charts" :key="sensors_param.id" class="sensor_data_chart">
            <h4>{{sensors_param.title}}</h4>
            <sensor-chart :sensors="sensors_param.sensors">
            </sensor-chart>
        </div>
    </div>
</template>

<script>
import load_device from '../../device'
import {DEVICE_PARAMS} from '../../definitions'
import {display_datetime} from '../../utils'

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
          const sp_length = DEVICE_PARAMS.length
          for (let co = 0; co < sp_length; co++) {
            const now = new Date()
            if (DEVICE_PARAMS[co].id in this.device.sensors_params) {
              const sensors = this.device.sensors_params[
                  DEVICE_PARAMS[co].id].sensors.filter(item => item.enabled)
              if (sensors.length) {
                const tstamp = new Date(this.device.sensors_params[DEVICE_PARAMS[co].id].master.tstamp)
                this.sensors_charts.push({
                  ...DEVICE_PARAMS[co],
                  sensors: sensors,
                  value: this.device.sensors_params[DEVICE_PARAMS[co].id].master.value,
                  tstamp: display_datetime(tstamp),
                  timeout: now - tstamp > 1800000
                })
              }
            }
          }
        })
    },
    display_datetime: display_datetime
  },
  computed: {
    schedule () {
      let r = null
      if (this.device && this.device.schedule_id) {
        const schedule = this.$store.state.schedules.find(
          schedule => schedule.id === this.device.schedule_id)
        if (schedule) {
          r = {title: schedule.title}
          const start = this.device.props_values[0]
          const now = new Date()
          if (now > start) {
            const day = Math.floor((now - start) / (1000 * 60 * 60 * 24))
            if (day < schedule.days) {
              r.today = schedule.items[day]
            }
          }
          if (!r.today) {
           r.today = {day_no: '-'}
          }
        }
      }
      return r
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
