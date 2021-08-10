<template>
    <table id="timers">
        <tr>
            <th>Начало</th>
            <th>Длительность</th>
            <th class="report"></th>
        </tr>
        <tr v-for="(item, idx) in timers" class="timer" :key="idx">
            <td class="start">
                <img :src="'/images/' + item.icon.icon" :title="item.icon.title"/>
                <span class="set_time">
                    <template v-if="item.time[2]">
                        {{seconds_to_timestring(item.time[0])}}
                    </template>
                </span>
                <span class="clock_time">
                    <template v-if="item.time[2]">
                        {{seconds_to_timestring(item.time[3])}}
                    </template>
                    <template v-else>
                        {{seconds_to_timestring(item.time[0])}}
                    </template>
                </span>
            </td>
            <td class="duration">
                {{item.time[1]}} сек
            </td>
            <td class="report">
                <img v-if="item.status" :src="'/images/icon_' + item.status + '.png'"/>
            </td>
        </tr>
    </table>
</template>

<script>
import {mapGetters} from 'vuex'

import SunCalc from 'suncalc'

import {seconds_to_timestring} from '../../utils'
import {timer_type_icon} from '../../definitions'
import {TZ_OFFSETS} from '../../timezones'

function timer_timestamp(value) {
  const today = new Date((new Date()).toDateString())
  today.setSeconds(value)
  return today
}

function log_timestamp(entry) {
  const r = new Date(entry.log_tstamp)
  r.setSeconds(0)
  return r
}

export default {
  name: "DeviceTimers",
  props: ["prop", "log"],
  data () {
    return {}
  },
  methods: {
    seconds_to_timestring: seconds_to_timestring,
  },
  computed: {
    ...mapGetters(['location', 'timezone']),
    timers () {
      let r = []
      if (this.prop.value) {
        let suntimes = null
        if (this.location && this.timezone) {
          const tz_offset = TZ_OFFSETS[this.timezone]
          const date_local = new Date()
          const utc = date_local.getTime() + date_local.getTimezoneOffset() * 60000
          const date_device = new Date(utc + 3600000 * tz_offset)
          const sun_data = SunCalc.getTimes(date_device,
            this.location[0], this.location[1])
          suntimes = ['sunrise', 'sunset'].map(
              entry => (sun_data[entry].getUTCHours() + tz_offset) * 3600 +
                sun_data[entry].getUTCMinutes() * 60)
        }
        r = this.prop.value.map(item => { 
          let due_time = null
          if (item[2]) {
            if (suntimes) {
              due_time = suntimes[item[2] == 1 ? 0 : 1] + item[0]
            }
          } else {
            due_time = item[0]
          }
          const time = [...item]
          time.push(due_time)
          return {
            time: time,
            status: null,
            icon: timer_type_icon(item[2])}
          }).sort((a, b) => {
            if (a.time[3] < b.time[3]){
              return -1
            }
            if (a.time[3] > b.time[3]){
              return 1
            }
            return 0
          })
      }
      if (this.log && this.log.log) { //timer jobs' status
        let log_idx = this.log.log.length - 1
        const now = new Date(this.log.device_timestamp)
        for (const timer of r) {
          const start = timer_timestamp(timer.time[3])
          if (start > now) {
            break
          }
          let evt_start = false, evt_stop = false, evt_reverse = false
          const stop = timer_timestamp(timer.time[3] + timer.time[1] + 60)
          for (; log_idx >= 0 && log_timestamp(this.log.log[log_idx]) < start; log_idx--) {
            continue
          }
          for (; log_idx >= 0 && log_timestamp(this.log.log[log_idx]) <= stop; log_idx--) {
            const line = this.log.log[log_idx].txt
            if (line === 'Feeder start timer') {
              evt_start = true
            } else if (line.includes(' reverse ')){
              evt_reverse = true
            } else if (line === 'Feeder stop timer') {
              evt_stop = true
              break
            }
          }
          if (evt_start && evt_stop && !evt_reverse) {            
            timer.status = 'done'
          } else if (!evt_start && !evt_stop) {
            timer.status = 'undone'
          } else {
            timer.status = 'alert'
          }
        }
      }
      return r
    }
  }
}

</script>

<style scoped>
</style>

