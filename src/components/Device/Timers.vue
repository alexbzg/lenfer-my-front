<template>
    <table id="timers">
        <tr>
            <th>Начало</th>
            <th>Длительность</th>
            <th class="report"></th>
        </tr>
        <tr v-for="(item, idx) in timers" class="timer" :key="idx">
            <td class="start">
                {{seconds_to_timestring(item.time[0])}}
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

import {seconds_to_timestring} from '../../utils'

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
    seconds_to_timestring: seconds_to_timestring
  },
  computed: {
    timers () {
      let r = []
      if (this.prop.value) {
        r = [...this.prop.value].sort((a, b) => {
          if (a[0] < b[0]){
            return -1
          }
          if (a[0] > b[0]){
            return 1
          }
          return 0
        }).map(item => { return {time: item, status: null} })
      }
      if (this.log) { //timer jobs' status
        let log_idx = this.log.length - 1
        const now = new Date((new Date()).getTime() - 120000)
        for (const timer of r) {
          const start = timer_timestamp(timer.time[0])
          if (start > now) {
            break
          }
          let evt_start = false, evt_stop = false, evt_reverse = false
          const stop = timer_timestamp(timer.time[0] + timer.time[1] + 60)
          for (; log_idx >= 0 && log_timestamp(this.log[log_idx]) < start; log_idx--) {
            continue
          }
          for (; log_idx >= 0 && log_timestamp(this.log[log_idx]) <= stop; log_idx--) {
            const line = this.log[log_idx].txt
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

