<template>
    <table id="timers">
        <tr>
            <template v-if="prop.timers_type === 'feeder'">
                <th>Начало</th>
                <th>Длительность, сек</th>
                <th class="report"></th>
            </template>
            <template v-if="prop.timers_type === 'switch'">
                <th>Включить</th>
                <th class="report"></th>
                <th>Выключить</th>
                <th class="report"></th>
            </template>
        </tr>
        <tr v-for="(row, row_idx) in timers" class="timer" :key="row_idx">
            <template v-for="(item, item_idx) in row">
                <td class="start" :class="{error: item.due >= 86400}" :key="'time' + row_idx + '_' + item_idx">
                    <img :src="'/images/' + item.icon.icon"/>
                    <span class="set_time">
                        <template v-if="item.time[2]">
                            {{(item.time[0] >= 0 ? '+' : '') + seconds_to_timestring(item.time[0], item.time[1] == -1)}}
                        </template>
                    </span>
                    <span class="clock_time">
                        <template v-if="item.time[2]">
                            {{seconds_to_timestring(item.due, item.time[1] === -1)}}
                        </template>
                        <template v-else>
                            {{seconds_to_timestring(item.time[0], item.time[1] === -1)}}
                        </template>
                    </span>
                    <span class="tooltip" v-if="item.time[2]">
                        {{tooltip_text(item)}}
                    </span>
                </td>
                <td class="duration" v-if="prop.timers_type === 'feeder'" :key="'duration' + row_idx + '_' + item_idx">
                    {{item.time[1]}} сек
                </td>
                <td class="report" :key="'report' + row_idx + '_' + item_idx">
                    <img v-if="item.status" :src="'/images/icon_' + item.status + '.png'"/>
                </td>
            </template>
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

const TIMERS_COLUMNS = {
  feeder: 1,
  switch: 2
}

export default {
  name: "DeviceTimers",
  props: ["prop", "log"],
  data () {
    return {}
  },
  methods: {
    seconds_to_timestring: seconds_to_timestring,
    get_suntime (timer_type) {
      return this.suntimes ? this.suntimes[timer_type == 1 ? 0 : 1] : null
    }, 
    tooltip_text (timer) {
      return `${timer.icon.title} ${seconds_to_timestring(this.get_suntime(timer.time[2]))} ` +
        `${timer.time[0] >= 0 ? '+' : ''}${seconds_to_timestring(timer.time[0])} \u21d2 ` + 
        `${seconds_to_timestring(timer.due)}`
    }
  },
  computed: {
    ...mapGetters(['location', 'timezone']),
    timers_type () {
      return this.prop && this.prop.timers_type ? this.prop.timers_type : 'feeder'
    },
    suntimes () {
      let r = null
      if (this.location && this.timezone) {
        const tz_offset = TZ_OFFSETS[this.timezone]
        const date_local = new Date()
        const utc = date_local.getTime() + date_local.getTimezoneOffset() * 60000
        const date_device = new Date(utc + 3600000 * tz_offset)
        const sun_data = SunCalc.getTimes(date_device, this.location[0], this.location[1])
        r = ['sunrise', 'sunset'].map(
          entry => (sun_data[entry].getUTCHours() + tz_offset) * 3600 +
            sun_data[entry].getUTCMinutes() * 60)
      }
      return r
    },
    timers () {
      let r = []
      if (this.prop.value) {
        const columns = TIMERS_COLUMNS[this.timers_type]
        const rows = this.prop.value.length / columns
        for (let row_idx = 0; row_idx < rows; row_idx++) {
          const row = []
          for (let col_idx = 0; col_idx < columns; col_idx++) {
            const timer = this.prop.value[row_idx * columns + col_idx]
            let due_time = null
            if (timer[2]) {
              if (this.suntimes) {
                due_time = this.get_suntime(timer[2]) + timer[0]
              }
            } else {
              due_time = timer[0]
            }
            const time = [...timer]
            row.push({
              time: time,
              due: due_time,
              status: null,
              icon: timer_type_icon(timer[2])
            })
          }
          r.push(row)
        }
        r.sort((a, b) => {
          if (a[0].due < b[0].due){
            return -1
          }
          if (a[0].due > b[0].due){
            return 1
          }
          return 0
        })
      }
      if (this.log && this.log.log) { //timer jobs' status
        let log_idx = this.log.log.length - 1
        const now = new Date(this.log.device_timestamp)
        for (const row of r) {
          for (const timer of row) {
            const start = timer_timestamp(timer.due - 120)
            if (start > now) {
              break
            }
            let evt_start = false, evt_stop = false, evt_reverse = false, evt_success = false
            const stop = timer_timestamp(timer.due + (timer.time[1] > 0 ? timer.time[1] : 0)  + 120)
            for (; log_idx >= 0 && log_timestamp(this.log.log[log_idx]) < start; log_idx--) {
              continue
            }
            for (; log_idx >= 0 && log_timestamp(this.log.log[log_idx]) <= stop; log_idx--) {
              const line = this.log.log[log_idx].txt
              if (line === 'Feeder start timer') {
                if (this.timers_type === 'switch') {
                  if (timer.time[1] === 0) {
                    evt_success = true
                    break
                  }
                } else {
                  evt_start = true
                }
              } else if (line.includes(' reverse ')){
                evt_reverse = true
              } else if (line === 'Feeder task success'){
                evt_success = true
              } else if (line === 'Feeder stop timer') {
                if (this.timers_type === 'switch') {
                  if (timer.time[1] === -1) {
                    evt_success = true
                    break
                  }
                } else {
                  evt_stop = true
                  break
                }
              }
            }
            if (this.timers_type === 'switch') {
              timer.status = evt_success ? 'done' : 'undone'
            } else if (this.timers_type === 'feeder') {
              if (evt_start && evt_stop && !evt_reverse) {            
                timer.status = 'done'
              } else if (!evt_start && !evt_stop) {
                timer.status = 'undone'
              } else {
                timer.status = 'alert'
              }
            }
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

