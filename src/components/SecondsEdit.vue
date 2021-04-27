<template>
    <masked-input
      type="text"
      v-model="edit_value"
      placeholderChar="0"
      class="time_input"
      :mask="$options.MASK">
    </masked-input>
</template>

<script>
import {seconds_to_timestring} from '../utils'
import MaskedInput, {conformToMask} from 'vue-text-mask'

const MASK = [/\d/, /\d/, ':',  /\d/, /\d/]

export default {
  MASK: MASK,
  name: "SecondsEdit",
  components: {MaskedInput},
  props: ["value"],
  computed: {
    edit_value: {
      get  () {
        return seconds_to_timestring(this.value)
      },
      set (value) {
        const conformed_value = conformToMask(value, MASK, {placeholderChar: '0'}).conformedValue
        this.$emit('input', 
          Number(conformed_value.substring(0,2))*3600 + 
            Number(conformed_value.substring(3,5))*60)
      }
    }
  }
}
</script>
<style>
</style>

