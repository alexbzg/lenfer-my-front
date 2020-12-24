<template>
    <table id="timers">
        <tr>
            <th>Начало</th>
            <th>Длительность</th>
        </tr>
        <tr v-for="(item, idx) in timers" class="timer" :key="idx">
            <td class="start">
                {{seconds_to_timestring(item[0])}}
            </td>
            <td class="duration">
                {{item[1]}} сек
            </td>
        </tr>
    </table>
</template>

<script>

import {seconds_to_timestring} from '../../utils'

export default {
  name: "DeviceTimers",
  props: ["prop"],
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
        })
      }
      return r
    }
  }
}

</script>

<style scoped>
</style>

