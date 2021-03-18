<template>
    <div id="feeder_timers">
        <table id="timers_setup">
            <tr>
                <th>Начало</th>
                <th>Длительность, сек</th>
                <th class="add_timer" @click="value.push(new_item())">
                  <img src="/images/icon_add.jpg" title="Добавить период"/>
                </th>
            </tr>
            <tr v-for="(item, item_idx) in timers_order" class="timer" :key="item_idx">
                <td :class="{error: item in validation_errors && 0 in validation_errors[item]}">
                    <seconds-edit v-model="value[item][0]">
                    </seconds-edit>
                </td>
                <td :class="{error: item in validation_errors && 1 in validation_errors[item]}">
                    <input type="number" v-model="value[item][1]"
                        @input="$emit('input', Number($event.target.value))"/>
                </td>
                <td @click="delete_item(props_headers, value, item)">
                    <img src="/images/icon_close.png" title="Удалить период"/>
                </td>
            </tr>
        </table>
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
  data () {
    return {
      timers_order: this.order_timers(),
      validation_errors: {}
    }
  },
  computed: {
    timers_count () {
      return this.value ? this.value.length : 0
    }
  },
  methods: {
    new_item () {
      return new Array(this.props_headers.items.length).fill(0)
    },
    order_timers () {
      let timers_order = []
        if (this.value) {
          timers_order = [...this.value].sort((a, b) => {
            if (a[0] < b[0]){
              return -1
            }
            if (a[0] > b[0]){
              return 1
            }
            if (a[1] < b[1]){
              return -1
            }
            if (a[1] > b[1]){
              return 1
            }
            return 0
        }).map(item => this.value.indexOf(item))
      }
      return timers_order
    }
  },
  watch: {
    timers_count () {
      this.timers_order = this.order_timers()
    },
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


