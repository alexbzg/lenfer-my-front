<template>
    <div id="feeder_timers">
        <span class="title">Расписание работы</span><br/>

        <table id="timers_setup">
            <tr>
                <th>Начало</th>
                <th>Длительность, сек</th>
                <th></th>
            </tr>
            <tr v-for="(item, item_idx) in value" class="timer" :key="item_idx">
                <td :class="{error: item_idx in validation_errors && 0 in validation_errors[item_idx]}">
                    <seconds-edit v-model="item[0]">
                    </seconds-edit>
                </td>
                <td :class="{error: item_idx in validation_errors && 1 in validation_errors[item_idx]}">
                    <input type="number" v-model="item[1]" 
                        @input="$emit('input', Number($event.target.value))"/>
                </td>
                <td @click="delete_item(props_headers, value, item_idx)">
                    <img src="/images/icon_close.png" title="Удалить период"/>
                </td>
            </tr>
        </table>
        <button class="add_timer" @click="value.push(new_item())">
            Добавить период
        </button>
        <br/>
    </div>
</template>

<script>
import DeviceProps from './DeviceProps'
import SecondsEdit from '../SecondsEdit'

export default {
  name: "FeederTimers",
  extends: DeviceProps,
  components: {SecondsEdit},
  methods: {
    new_item () {
      return new Array(this.props_headers.items.length).fill(0)
    }
  },
  data () {
    return {
      validation_errors: {}
    }
  },
  watch: {
    value: {
      deep: true,
      handler () {
        let r = null
        this.validation_errors = {}
        const timers_count = this.value.length
        for (let co = 0; co < timers_count; co++) {
          if (this.value[co][1] !== parseInt(Number(this.value[co][1]))) {
            this.value[co][1] = parseInt(Number(this.value[co][1]))
          }
          if (this.value[co][1] === 0) {
            r = 'Длительность периода должна быть больше 0.'
            this.validation_errors[co] = {1: 1}
            break
          }
          const limits = [this.value[co][0], this.value[co][0] + this.value[co][1]]
          for (let check_co = 0; check_co < co; check_co++) {
            const check = [this.value[check_co][0], this.value[check_co][0] + this.value[check_co][1]]
            if ((limits[0] >= check[0] && limits[0] <= check[1]) ||
                (limits[1] >= check[0] && limits[1] <= check[1])) {
                r = 'Конфликт периодов.'
                this.validation_errors[co] = {0: 1, 1: 1}  
                this.validation_errors[check_co] = {0: 1, 1: 1}
                break
            }
          }
        }
        this.$emit('validated', 'timers', r)
        this.validated = r
        }
    }
  }
}

</script>

<style scoped>
</style>


