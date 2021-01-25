<template>
  <div class="device_index" v-if="device">

        <div class="controller_info">
            <span class="info_title">{{device.title ? device.title : device.type}}</span>
        </div>

        <div class="border">
        <table class="controller_table" v-if="device_type && device_type.schedule_params">
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
                    <!-- <br/><span class="current_time" :class="{timeout: param.timeout}">{{param.tstamp}}</span> -->
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
            <tr>
                <td colspan="4">
                    <span class="current_time">
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

        <router-link :to="'/settings/devices/' + device_id"
            v-if="device_props.custom.length || device_props.standart.length"
            tag="div" class="border">
            <component v-for="(prop, idx) in device_props.custom" :is="prop.component"
                :prop="prop" :key="idx"></component>
            <table id="props" v-if="device_props.standart.length">
                <tr v-for="(prop, idx) in device_props.standart" :key="idx">
                    <td class="prop_title">{{prop.title.title}}</td>
                    <td class="prop_value">{{prop.value}}</td>
                </tr>
            </table>
        </router-link>

        <div class="border" v-if="log && log.length">
            <log-summary :log="log"></log-summary>
        </div>

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


    </div>
</template>

<script>
import strftime from 'strftime'

import load_device from '../../device'
import {dataPost} from '../../api'
import {DEVICE_PARAMS} from '../../definitions'
import {display_datetime} from '../../utils'

import SensorChart from './SensorChart'
import LogSummary from './LogSummary'

const SHOW_LOG_DEVICE_TYPES = ["Feeder"]

const CUSTOM_PROPS = {timers: () => import('./Timers')}
const CHART_INTERVALS_SETTINGS = [
  {title: '4 часа', hours: 4},
  {title: '24 часа', hours: 24}
]

export default {
  name: 'DeviceIndex',
  components: {SensorChart, LogSummary},
  CHART_INTERVALS_SETTINGS: CHART_INTERVALS_SETTINGS,
  props: ['device_id'],
  data () {
    return {
      device: {},
      log: null,
      chart_interval_idx: 0,
      sensors_charts: []
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

          if (SHOW_LOG_DEVICE_TYPES.includes(this.device.type)) {
            const end = new Date()
            const begin = new Date()
            begin.setDate(begin.getDate() - 1)
            dataPost('devices_log', {
              device_id: this.device_id,
              begin: strftime('%Y-%m-%d %H:%M:%S', begin),
              end:  strftime('%Y-%m-%d %H:%M:%S', end)
            })
              .then(data => {
                this.log = data
              })
          }

        })
    },
    display_datetime: display_datetime
  },
  computed: {

    chart_interval () {
      const end = new Date()
      const begin = new Date()
      begin.setHours(begin.getHours() - CHART_INTERVALS_SETTINGS[this.chart_interval_idx].hours)
      return [begin, end]
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
        if (schedule) {
          r = {title: schedule.title}
          const start = this.device.props_values[0]
          const now = new Date()
          if (now > start) {
            const day = Math.floor((now - start) / (1000 * 60 * 60 * 24))
            if (day < schedule.days) {
              r.today = schedule.items[day]
            } else {
              r.today = schedule.items[schedule.days - 1]
            }
          } else if  (schedule.days > 0) {
            r.today = schedule.items[0]
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

<style scoped>
</style>
