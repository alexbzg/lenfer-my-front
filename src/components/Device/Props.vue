<template>
    <modal @close="close_modal">
        <h3 slot="header">Свойства устройства</h3>
        <div slot="body">
            Название
            <input class="text" v-model="edit_title"/><br/>
            <span v-for="(prop, idx) in props_titles" :key="idx">
                {{prop.title}}
                <date-picker v-model="edit_props[idx]" v-if="prop.type === 'date'"
                    :masks="{input: 'DD MMMM'}"></date-picker>
                <select v-if="prop.type === 'birds'" v-model="edit_props[idx]">
                    <option v-for="bird in $options.BIRDS" :key="bird">{{bird}}</option>
                </select>
                <br/>
            </span>
        </div>

        <div slot="footer">
            <button class="modal-default-button" @click="$emit('close', edit_title, edit_props)">
                OK
            </button>
            <button class="modal-default-button" @click="$emit('close', false, false)">
                Отмена
            </button>
        </div>
    </modal>
</template>

<script>

import DatePicker from 'v-calendar/lib/components/date-picker.umd'

import Modal from '../Modal.vue'

const BIRDS = ["Бройлеры", "Дятлы", 'Страусы']

export default {
  BIRDS: BIRDS,
  name: 'DeviceProps',
  props: ['title', 'props_titles', 'props_values'],
  components: {Modal, DatePicker},
  data () {
    const edit_props = []
    const length = this.props_titles.length
    for (let co = 0; co < length; co++) {
      edit_props.push(this.props_titles[co].type === 'date' ?
        new Date(this.props_values[co]) : this.props_values[co])
    }
    return {
      edit_title: this.title,
      edit_props: edit_props
    }
  },
  methods: {
    close_modal (title, props) {
      this.$emit('close', title, props)
    }
  }

}

</script>

