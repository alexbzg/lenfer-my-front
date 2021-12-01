<template>
    <td :class="{error: validation_errors && 0 in validation_errors}">
        <v-select v-model="value[2]" :options="$options.TIMER_TYPES"
            :reduce="timer_type => timer_type.code" :clearable="false" 
            :searchable="false" :tabindex="1" label="title"
            :ref="'timer_type_select'" 
            @open="timer_type_select_open" 
            >
            <template #selected-option="option">
                <img :src="'/images/' + option.icon" :title="option.title"/>
            </template>
            <template #option="option">
                <img :src="'/images/' + option.icon" :title="option.title"/>
            </template>
        </v-select>
        <seconds-edit v-model="value[0]" :sign="value[2] !== 0" :enable_seconds="value[1] === -1">
        </seconds-edit>
    </td>
</template>

<script>

import SecondsEdit from '../SecondsEdit'
import {TIMER_TYPES} from '../../definitions'

export default {
  name: "TimerEntry",
  props: ["value", "timer_type_select_active", "validation_errors"],
  components: {SecondsEdit},
  TIMER_TYPES: TIMER_TYPES,
  data () {
    return {}
  },
  methods: {
    timer_type_select_open () {
      this.$emit('timer-type-select-open')
    },
    timer_type_input (idx) {
      this.value[idx][0] = 0
    }
  },
  watch: {
    timer_type_select_active () {
      this.$refs['timer_type_select'].open = this.timer_type_select_active
    }
  }
}

</script>

<style scoped>
.vs__search {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  margin: -1px !important;
  border: 0 !important;
  clip: rect(0 0 0 0) !important;
}
.form-control {
  position: absolute
}
</style>


