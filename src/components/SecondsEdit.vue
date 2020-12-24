<template>
    <masked-input
      type="text"
      v-model="edit_value"
      :mask="[/\d/, /\d/, ':',  /\d/, /\d/]">
    </masked-input>
</template>

<script>
import {seconds_to_timestring} from '../utils'
import MaskedInput from 'vue-text-mask'

export default {
  name: "SecondsEdit",
  components: {MaskedInput},
  props: ["value"],
  computed: {
    edit_value: {
      get  () {
        return seconds_to_timestring(this.value)
      },
      set (value) {
        this.$emit('input', 
          Number(value.substring(0,2))*3600 + 
            Number(value.substring(3,5))*60)
      }
    }
  }
}
</script>
<style>
</style>

