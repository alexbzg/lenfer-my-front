<template>
    <div id="timers">
        <span class="title">Расписание работы</span><br/>

        <table id="timers">
            <tr>
                <th>Начало</th>
                <th>Длительность</th>
            </tr>
            <tr v-for="(item, idx) in prop.value" class="timer" :key="idx">
                <td class="start">
                    {{seconds_to_timestring(item[0])}}
                </td>
                <td class="duration">
                    {{item[1]}} сек
                </td>
            </tr>
        </table>
    </div>
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
  }
}

</script>

<style scoped>
</style>

