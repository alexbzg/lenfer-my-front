<template>
    <div class="device_props">
        <div class="prop" v-for="(prop, idx) in props_headers" :key="idx">
            <span class="title">{{prop.title}}</span><br/>
            <template v-if="prop.type === 'date'">
                <date-picker v-model="value[idx]" locale="ru"
                    :masks="{input: 'DD MMMM'}"></date-picker><br/>
            </template>
            <template v-if="prop.type === 'seconds'">
                <seconds-picker v-model="value[idx]" :enable_fields="prop.enable"></seconds-picker>
                <br/>
            </template>
            <template v-if="'items' in prop">
                <device-props :props_headers="prop.items" v-for="(item, item_idx) in value[idx]"
                    :key="item_idx" :value="item">
                </device-props>
                <div class="add_prop_item" @click="value[idx].push(new_item())">
                    Добавить {{prop.title_single}}
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

import SecondsPicker from '../SecondsPicker'

export default {
  name: "DeviceProps",
  props: ["props_headers", "value"],
  components: {DatePicker, SecondsPicker},
  methods: {
    new_item () {
      return new Array(this.props_headers.length).fill(null)
    }
  }
}

</script>

<style scoped>
</style>


