<template>
    <div class="time_input">
        <input id="hours" v-model="edit_hours" :class="{error: isNaN(hours) || hours > 23}"
            />:<input id="minutes" v-model="edit_minutes" :class="{error: isNaN(minutes) || minutes > 59}"/>
    </div>
</template>

<script>
import {seconds_to_timetuple} from '../utils'

export default {
  name: "SecondsEdit",
  props: ["value", "sign"],
  data () {
    const time = seconds_to_timetuple(this.value)
    return {
      edit_sign: this.sign && time[0] < 0 ? -1 : 1,
      hours: Math.abs(time[0]),
      minutes: Math.abs(time[1])
    }
  },
  computed: {
    edit_hours: {
      get () {
        return this.format(this.hours, true)
      },
      set (value) {
        if (value.startsWith('+') || value.startsWith('-')) {
          this.edit_sign = value.startsWith('-') ? -1 : 1
          value = value.replace(/^[+-]+/, "")
        } else if (this.sign) {
          this.edit_sign = 1
        }
        this.hours = parseInt(value)
        this.input()
      }
    },
    edit_minutes: {
      get () {
        return this.format(this.minutes)
      },
      set (value) {
        this.minutes = parseInt(value)
        this.input()
      }
    }
  },
  methods: {
    format (value, sign) {
      if (isNaN(value))
        return null
      let str_value = value < 10 ? "0" + value : value
      if (this.sign && sign) {
        str_value = (this.edit_sign === -1 ? "-" : "+") + str_value
      }
      return str_value
    },
    input () {
      this.$emit('input', this.edit_sign * (this.hours * 3600 + this.minutes * 60))
    }
  }
}
</script>
<style>
</style>

