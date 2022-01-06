<template>
    <div class="time_input">
        <input class="seconds_edit_hours" v-model="edit_hours" 
            :class="{error: isNaN(hours) || hours > 23}">:<input class="seconds_edit_minutes" 
            v-model="edit_minutes" :class="{error: isNaN(minutes) || minutes > 59}"/><template 
                v-if="enable_seconds">:<input class="seconds_edit_seconds" 
                    v-model="edit_seconds" 
                    :class="{error: isNaN(seconds) || seconds > 59}"/></template>
    </div>
</template>

<script>
import {seconds_to_timetuple} from '../utils'

export default {
  name: "SecondsEdit",
  props: ["value", "sign", "enable_seconds"],
  data () {
    const time = seconds_to_timetuple(this.value, this.enable_seconds)
    return {
      edit_sign: this.sign && (time[0] < 0 || (time[0] === 0 && time[1] < 0)) ? -1 : 1,
      hours: Math.abs(time[0]),
      minutes: Math.abs(time[1]),
      seconds: this.enable_seconds ? Math.abs(time[2]) : 0
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
        value = this.trim0(value)
        if (value.length > 2) {
          value = value.substring(0, 2)
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
        value = this.trim0(value)
        if (value.length > 2) {
          value = value.substring(0, 2)
        }
        this.minutes = parseInt(value)
        this.input()
      }
    },
    edit_seconds: {
      get () {
        return this.enable_seconds ? this.format(this.seconds) : 0
      },
      set (value) {
        value = this.trim0(value)
        if (this.enable_seconds) {
          if (value.length > 2) {
            value = value.substring(0, 2)
          }
          this.seconds = parseInt(value)
          this.input()
        }
      }
    },
    edit_value () {
      return this.edit_sign * (this.hours * 3600 + this.minutes * 60 + this.seconds)
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
    trim0 (value) {
      while (value.length > 2 && value.startsWith('0')) {
        value = value.substring(1)
      }
      return value
    },
    input () {
      this.$emit('input', this.edit_value)
    }
  },
  watch: {
    value (val) {
      if (val !== this.edit_value) {
        const time = seconds_to_timetuple(val, this.edit_seconds)
        this.edit_sign = this.sign && (time[0] < 0 || (time[0] === 0 && time[1] < 0)) ? -1 : 1,
        this.hours = Math.abs(time[0]),
        this.minutes = Math.abs(time[1])
        this.seconds = this.edit_seconds ? Math.abs(time[3]) : 0 
      }
    }
  }
}
</script>
<style>
</style>

