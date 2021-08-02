<template>
    <masked-input
      type="text"
      v-model="edit_value"
      placeholderChar="0"
      class="time_input"
      :mask="mask">
    </masked-input>
</template>

<script>
import {seconds_to_timestring} from '../utils'
import MaskedInput, {conformToMask} from 'vue-text-mask'

const MASK = [/\d/, /\d/, ':',  /\d/, /\d/]
const MASK_SIGN = [/[+-]/]

export default {
  name: "SecondsEdit",
  components: {MaskedInput},
  props: ["value", "sign"],
  computed: {
    edit_value: {
      get  () {
        let value = seconds_to_timestring(this.value)
        if (this.sign && this.value > 0) {
          value = '+' + value
        }
        return value
      },
      set (value) {
        const conformed_value = conformToMask(value, this.mask, {placeholderChar: '0'}).conformedValue
        const sign_length = this.sign ? 1 : 0
        const sign_mult = conformed_value.startsWith('-') ? -1 : 1
        this.$emit('input', 
          sign_mult *
          (Number(conformed_value.substring(sign_length, 2 + sign_length))*3600 + 
            Number(conformed_value.substring(3 + sign_length, 5 + sign_length))*60))
      }
    },
    mask () {
      return this.sign ? MASK_SIGN.concat(MASK) : MASK
    }
  }
}
</script>
<style>
</style>

