<template>
  <div class="device_index">

        <div class="controller_info">
            <span class="info_title">{{device.title ? device.title : device.type}}</span><br/>
            <span class="info_data" v-for="(prop, idx) in device.props_titles" :key="idx">
                {{prop.title}} <span>{{device.props_display[idx]}}</span>
            </span>
        </div>
        

        <table class="controller_table">
            <tr>
                <th></th>
                <th v-for="param in sensors_charts" :key="param.id">
                    {{param.title}}
                    <template v-if="param.unit">
                        ({{param.unit}})
                    </template>
                </th>
            </tr>
            <!--tr v-if="schedule">
                <td>
                    Таблица работы {{schedule.title}} <br/>
                    День содержания {{schedule.today.no}}
                </td>
                <td v-for="param in sensors_charts" :key="param.id">
                    <template v-if="schedule.today.params">
                        {{schedule.today.params[param.id].value}}
                    </template>
                    <template v-if="!schedule.today.params">
                        Н/Д
                    </template>
                </td>
            </tr-->
            <!--tr>
                <td></td>
                <td v-for="param in sensors_charts" :key="param.id">
                    {{param.value}}
                    <span class="time">{{param.tstamp}}</span>
                </td>
            </tr-->
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
      schedule: null,
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
          if (device.schedule_id) {
            const schedule = this.$store.state.schedules.find(
              schedule => schedule.id === device.schedule_id)
            if (schedule) {
              this.schedule = {title: schedule.title}
              const start = new Date(device.props_values[0])
              const now = new Date()
              if (now > start) {
                const day = Math.floor((now - start) / (1000 * 60 * 60 * 24))
                if (day < schedule.days) {
                  this.schedule.today = schedule.days[day]
                }
              }
              if (!this.schedule.today) {
                this.schedule.today = {
                  no: 'Н/Д',
                  params: {}
                }
              }
            }
          }
          for (let co = 0; co < sp_length; co++) {
            if (DEVICE_PARAMS[co].id in this.device.sensors_params) {
              this.sensors_charts.push({
                ...DEVICE_PARAMS[co],
                sensors: this.device.sensors_params[DEVICE_PARAMS[co].id].sensors,
                value: this.device.sensors_params[DEVICE_PARAMS[co].id].master.value,
                tstamp: this.device.sensors_params[DEVICE_PARAMS[co].id].master.tstamp 
              })
            }
          }
        })
    },
    display_datetime: display_datetime
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
