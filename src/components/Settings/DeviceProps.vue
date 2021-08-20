<template>
    <div class="device_props">
        <slot name="device_title"></slot>

        <template v-for="(prop, idx) in props">
            <div class="prop" :key="idx" v-if="!custom_props[prop.id]">
                <template v-if="prop.type === 'date'">
                    <date-picker v-model="prop.value" locale="ru"
                        :masks="{input: 'DD MMMM'}"></date-picker>
                </template>
                <template v-if="prop.type === 'seconds'">
                    <seconds-edit v-model="prop.value"></seconds-edit>
                </template>
                <template v-if="prop.type === 'integer'">
                    <input type="number" v-model.number="prop.value"/>
                </template>
                <template v-if="prop.type === 'float_delta'">
                    <input type="number" v-model.number="prop.value[0]"/>
                    &plusmn;
                    <input type="number" v-model.number="prop.value[1]"/>
                </template>
                <span v-if="prop.unit" v-html="prop.unit"></span>

                <br/><span class="title">{{prop.title}}</span>
                <template v-if="'items' in prop">
                    <div v-for="(item, item_idx) in prop.value" class="prop_item" :key="item_idx">
                        <device-props v-model="prop_items[idx][item_idx]">
                        </device-props>
                        <button class="delete_prop_item" 
                            @click="delete_item(prop, item_idx)">
                            Удалить {{prop.title_item}}
                        </button>
                    </div>
                    <br/>
                    <button class="add_prop_item" @click="new_item(prop)">
                        Добавить {{prop.title_item}}
                    </button>
                </template>
                <br/>
            </div>
        </template>
    </div>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

import SecondsEdit from '../SecondsEdit'

import messageBox from '../../message-box'

import {DEVICE_CUSTOM_PROPS} from '../../definitions'

export default {
  DEVICE_CUSTOM_PROPS: DEVICE_CUSTOM_PROPS,
  name: "DeviceProps",
  props: ["value", "device_type_id"],
  components: {DatePicker, SecondsEdit}, 
  data () {
    return {
      validated: {},
    }
  },
  methods: {
    new_item (prop) {
      prop.value.push(new Array(prop.items.length).fill(null))
    },
    delete_item (prop, idx) {
      messageBox(`Удаление ${prop.title_item_genitive}`,
        `Вы действительно хотите удалить этот ${prop.title_item}?`,
        true)
        .then(() => {
            prop.value.splice(idx, 1)
        })
    },
    on_validated (prop_id, msg) {
      this.validated[prop_id] = msg
      this.$emit('validated', this.validated)
    }
  }, 
  computed: {
    props () {
      return Array.isArray(this.value) ? this.value : [this.value]
    },
    prop_items () {
      let r = []
      this.props.forEach(prop => {
        if ('items' in prop) {
          const items = prop.value.map(item => {
            return {
              ...prop.items,
              value: item
            }
          })
          r.push(items)
        } else {
          r.push(null)
        }
      })
      return r
    },

    custom_props () {
      const r = {}
      for (const custom_prop_def of DEVICE_CUSTOM_PROPS) {
        if (custom_prop_def.device_type_id === this.device_type_id) {
          r[custom_prop_def.prop_id] = true
        }
      }
      return r
    }
  },
  watch: {
    value: {
      deep: true,
      handler () {
        this.props.forEach(prop => {
          if (prop.type === 'integer' && prop.value !== parseInt(Number(prop.value))) {
            prop.value = parseInt(Number(prop.value))
          }
        })
      }
    }
  }
}

</script>

<style scoped>
</style>


