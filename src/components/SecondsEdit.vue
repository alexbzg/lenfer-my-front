<template>
    <masked-input
      type="text"
      v-model="edit_value"
      @input="on_input"
      :mask="[/\d/, /\d/, ':',  /\d/, /\d/]">
    </masked-input>
</template>

<script>
import {string_pad} from '../utils'
import MaskedInput from 'vue-text-mask'

export default {
    name: "SecondsEdit",
    components: {MaskedInput},
    props: ["value"],
    data () {
      const value = this.value || 0
      const hr = Math.floor(value/3600)
      const mn = Math.floor((value - hr*3600)/60)
      return {
        edit_value: `${string_pad(hr)}:${string_pad(mn)}`
      }
    },
    methods: {
      on_input () {
        this.$emit('input', 
          Number(this.edit_value.substring(0,2))*3600 + 
            Number(this.edit_value.substring(3,5))*60)

      }
    }
}
</script>
<style>
</style>

