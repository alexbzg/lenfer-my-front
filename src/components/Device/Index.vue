<template>
  <div>


      <loading v-if="load_in_progress"></loading>

  <div class="device_index" v-if="device">

        <div class="border" v-if="(device_type && device_type.schedule_params)
            || sensors_charts.length">
        <table class="controller_table">
            <tr id="header" v-if="device_type && device_type.schedule_params">
                <th v-for="param in sensors_charts" :key="param.id" class="parameter">
                    {{param.title}}
                </th>
                <th class="schedule_day" v-if="schedule && schedule.today.day_no">День</th>
                <th id="schedule" v-if="schedule && schedule.title">Таблица работы</th>
            </tr>
            <tr v-else>
                <template v-for="param in sensors_charts">
                    <th v-for="sensor in param.sensors" class="parameter"
                        :key="sensor.id">
                        {{sensor.title ? sensor.title : sensor.default_title}}
                    </th>
                </template>
            </tr>
            <tr v-if="device_type && device_type.schedule_params">
                <td v-for="param in sensors_charts" :key="param.id" class="parameter">
                    <span class="current_data" >
                        {{param.value}}<template v-if="param.unit && param.value">{{param.unit}}</template>
                    </span>
                    <span class="schedule_data">
                      <template v-if="schedule && schedule.today.params && schedule.today.params[param.id]">
                        {{schedule.today.params[param.id]}}<template v-if="param.unit">{{param.unit}}</template>
                      </template>
                      <template v-if="!schedule || !schedule.today.params"></template>
                    </span>
                </td>
                <td class="schedule_day" v-if="schedule && schedule.today.day_no">
                    <template>{{schedule.today.day_no}}</template>
                </td>
                <td id="schedule" v-if="schedule && schedule.title">
                    <router-link :to="'/settings/schedules/' + device.schedule_id" v-if="schedule">
                        {{schedule.title}}
                    </router-link>
                </td>
            </tr>
            <tr v-else>
                <template v-for="param in sensors_charts">
                    <td v-for="sensor in param.sensors" class="parameter"
                        :key="sensor.id">
                        <span class="current_data" v-if="sensor.value">
                            {{sensor.value}}{{param.unit}}
                        </span>
                    </td>
                </template>
            </tr>
            <tr>
                <td colspan="4">
                    <span class="current_time" :class="{timeout: sensors_charts[0].timeout}">
                        {{sensors_charts[0].tstamp}}
                    </span>
                </td>
            </tr>
        </table>
        </div>

        <div class="right" v-if="sensors_charts.length">
          <div id="charts_button" class="btn" @click="toggle_chart_interval">
              {{$options.CHART_INTERVALS_SETTINGS[chart_interval_idx_next].title}}
          </div>
        </div>

        <div v-for="sensors_param in sensors_charts" :key="sensors_param.id" class="sensor_data_chart">
            <h4>{{sensors_param.title}}</h4>
            <sensor-chart :sensors="sensors_param.sensors" :interval="chart_interval">
            </sensor-chart>
        </div>

        <div v-for="switch_item in switches_enabled" :key="switch_item.id" class="switch_chart">
            <h4>{{switch_item.title || switch_item.default_title}}</h4>
            <switch-chart :switch="switch_item" :device_id="device.id" :interval="chart_interval">
            </switch-chart>
        </div>

        <router-link :to="'/settings/devices/' + device_id"
            v-if="device_props.custom.length || device_props.standart.length"
            tag="div" class="border">
            <component v-for="(prop, idx) in device_props.custom" :is="prop.component"
                :prop="prop" :key="idx" :log="log"></component>
            <table id="props" v-if="device_props.standart.length">
                <tr v-for="(prop, idx) in device_props.standart" :key="idx">
                    <td class="prop_title">{{prop.title.title}}</td>
                    <td class="prop_value">{{prop.value}}</td>
                </tr>
            </table>
        </router-link>

        <div class="border" v-if="log && log.log && log.log.length">
            <log-summary :log="log"></log-summary>
        </div>
<!--
        <table id="log" v-if="log && log.length">
            <tr class="head">
                <th class="server_tstamp">Время (сервер)</th>
                <th class="device_tstamp">Время (устройcтво)</th>
                <th class="text">Запись</th>
            </tr>
            <tr v-for="(entry, idx) in log" :key="idx">
                <td class="server_tstamp">{{entry.rcvd_tstamp}}</td>
                <td class="device_tstamp">{{entry.log_tstamp}}</td>
                <td class="txt">{{entry.txt}}</td>
            </tr>
        </table>
-->

    </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'

import load_device from '../../device'
import {dataPost} from '../../api'
import {DEVICE_SENSORS_PARAMS} from '../../definitions'
import {display_datetime} from '../../utils'

import SensorChart from './SensorChart'
import SwitchChart from './SwitchChart'
import LogSummary from './LogSummary'
import Loading from '../Loading'

//import {debugLog} from '../../utils'

const SHOW_LOG_DEVICE_TYPES = ["Feeder"]

const CUSTOM_PROPS = {timers: () => import('./Timers')}
const CHART_INTERVALS_SETTINGS = [
  {title: '4 часа', interval: '4 hours'},
  {title: '24 часа', interval: '24 hours'}
]

export default {
  name: 'DeviceIndex',
  components: {SensorChart, SwitchChart, LogSummary, Loading},
  CHART_INTERVALS_SETTINGS: CHART_INTERVALS_SETTINGS,
  props: ['device_id'],
  data () {
    return {
      device: {},
      log: null,
      chart_interval_idx: 0,
      sensors_charts: [],
      load_in_progress: false
    }
  },
  async mounted () {
    this.load_device()
  },
  methods: {
    async toggle_chart_interval () {
      this.chart_interval_idx = this.chart_interval_idx_next
    },
    async load_device () {
      this.device = {}
      this.log = null
      this.sensors_charts = []
      this.load_in_progress = true
      load_device(this.device_id)
        .then(device => {
          this.device = device
          this.sensors_charts = []
          const sp_length = DEVICE_SENSORS_PARAMS.length
          for (let co = 0; co < sp_length; co++) {
            const now = new Date()
            if (DEVICE_SENSORS_PARAMS[co].id in this.device.sensors_params) {
              const sensors = this.device.sensors_params[
                  DEVICE_SENSORS_PARAMS[co].id].sensors.filter(item => item.enabled)
              if (sensors.length) {
                const tstamp = new Date(this.device.sensors_params[DEVICE_SENSORS_PARAMS[co].id].master.tstamp)
                this.sensors_charts.push({
                  ...DEVICE_SENSORS_PARAMS[co],
                  sensors: sensors,
                  value: this.device.sensors_params[DEVICE_SENSORS_PARAMS[co].id].master.value,
                  tstamp: display_datetime(tstamp),
                  timeout: now - tstamp > 600000
                })
              }
            }
          }

          if (SHOW_LOG_DEVICE_TYPES.includes(this.device.type)) {
            dataPost('devices_log', {
              device_id: this.device_id
            })
              .then(data => {
                this.log = data
              })
          }

        })
      .finally(() => {
        this.load_in_progress = false
      })
    },
    display_datetime: display_datetime,
  },
  computed: {
    ...mapState(['devices']),
    userLogin () {
      return this.$store.getters.userLogin
    },

    switches_enabled () {
      return this.device.switches ? this.device.switches.filter(item => item.enabled) : []
    },

    chart_interval () {
      return CHART_INTERVALS_SETTINGS[this.chart_interval_idx].interval
    },

    chart_interval_idx_next () {
      if (this.chart_interval_idx === CHART_INTERVALS_SETTINGS.length - 1) {
        return 0
      } else {
        return this.chart_interval_idx + 1
      }
    },

    device_type () {
      let r = null
      if (this.device) {
        const device_type = this.$store.state.devices_types.find(
          item => item.id === this.device.type_id)
        if (device_type) {
          r = device_type
        }
      }
      return r
    },

    device_props () {
      let r = {'custom': [], 'standart': []}
      if (this.device_type) {
        const props_length = this.device.props_titles.length
        for (let co = 0; co < props_length; co++) {
          if (this.device.props_titles[co].display) {
            const prop = {
              'title': this.device.props_titles[co],
              'value': this.device.props_values[co]
            }
            if (prop.title.id in CUSTOM_PROPS) {
              prop.component = CUSTOM_PROPS[prop.title.id]
              r.custom.push(prop)
            } else {
              r.default.push(prop)
            }
          }
        }
      }
      return r
    },

    schedule () {
      let r = null
      if (this.device && this.device.schedule_id) {
        const schedule = this.$store.state.schedules.find(
          schedule => schedule.id === this.device.schedule_id)
        const start = this.device.props_values[0]
        const now = new Date()
        const day = Math.floor((now - start) / (1000 * 60 * 60 * 24))
        let day_idx = -1
        if (schedule) {
          r = {title: schedule.title}
          if (now > start) {
            if (day < schedule.days) {
              day_idx = day
            } else {
              day_idx = schedule.days - 1
            }
          } else if  (schedule.days > 0) {
            day_idx = 0
          }
          if (day_idx !== -1) {
            const schedule_item = schedule.items[day_idx]
            r.today = {day_no: schedule_item.day_no, params: {}}
            const params_length = this.device_type.schedule_params.length
            for (let param_co = 0; param_co < params_length; param_co++) {
              r.today.params[this.device_type.schedule_params[param_co].id] = schedule_item.params[param_co]
            }
          }
          if (!r.today) {
            r.today = {day_no: '-'}
          }
        } else {
          r = {today: {day_no: day > 0 ? day : null}}
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

<style scoped>
</style>
