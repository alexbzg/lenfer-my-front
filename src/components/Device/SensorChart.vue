<template>
    <div>
        <div class="total" v-if="total.some(item => item)">
            <span 
                :class="'sensor_' + sensors[idx].group.toString()" 
                v-for="(item, idx) in total" 
                :key="idx">
                <span class="sensor">{{sensors[idx].title}}:</span>
                <span class="value">{{item.value}}</span>
                <span class="unit">{{item.unit}}</span>
            </span>
        </div>
        <line-chart css-classes="lk_sensor_graf" v-if="ready" 
            :chart_data="chart_data" :options="chart_options">
        </line-chart>
    </div>
</template>

<script>
import {ru} from 'date-fns/locale'

import {dataPost} from '../../api'
import LineChart from '../LineChart'
import {POWER_SENSORS_COLORS} from '../../definitions'

const SENSOR_TYPE_SETTINGS = {
  temperature: {
    dataset: [{
       gradients: {
         backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 0.1)'],
       },
       borderColor: 'rgba(255, 99, 132, 1)'
    },
    {
       gradients: {
         backgroundColor: ['rgba(200, 99, 132, 0.6)', 'rgba(200, 99, 132, 0.1)'],
       },
       borderColor: 'rgba(200, 99, 132, 1)'
    },
    {
       gradients: {
         backgroundColor: ['rgba(155, 99, 132, 0.6)', 'rgba(155, 99, 132, 0.1)'],
       },
       borderColor: 'rgba(155, 99, 132, 1)'
    }]
  },
  humidity: {
    dataset: [{
       gradients: {
         backgroundColor: ['rgba(99, 255, 132, 0.6)', 'rgba(99, 255, 132, 0.1)'],
       },
       borderColor: 'rgba(99, 255, 132, 1)'
    }]
  },
  voltage: {dataset: POWER_SENSORS_COLORS},
  current: {dataset: POWER_SENSORS_COLORS},
  power: {dataset: POWER_SENSORS_COLORS, 
    total: {
      item_value: (value, duration) => {
        return value*duration/3600000000
      },
      unit: "КВт*ч"
    }
  }
}

const DATASET_TMPLT = {
  borderWidth: 3,
  pointRadius: 0,
  pointHitRadius: 0.4,
  spanGaps: false,
  fill: 'start'
}

export default {
  name: 'SensorChart',
  components: {LineChart},
  props: ['sensors', 'interval', 'chart_break_interval'],
  data () {
    return {
      ready: false,
      chart_data: {
        datasets: []
      },
      total: [],
      chart_options: {
        vertical_cursor: {
          style: 'grey',
          width: 1
        },
		responsive: true,
		maintainAspectRatio: false,
        tooltips: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
          position: 'nearest',
          itemSort: (a, b) => b.value - a.value
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'time',
            adapters: {
              date: {
                locale: ru
              }
            },
            time: {
              unit: 'hour',
              stepSize: 1,           
              tooltipFormat: 'dd MMMM HH:mm',
              displayFormats: {
                hour: 'HH:mm',
				minute: 'HH:mm',
                day:'dd MMMM'
              }
            }
          }],
          yAxes: [{
            ticks: {},
            position: 'right'
          }]
        }
      }
    }
  },  
  async mounted () {
    this.render_chart()
  },
  methods: {

    async render_chart() {

      this.ready = false

      const sensors_idxs = {}
      const ready = this.sensors.map(() => false)
      const sensors_count = this.sensors.length
      let data_min = this.sensors.map(() => null)
      let data_max = this.sensors.map(() => null)
      this.chart_data.datasets = []
      this.total = this.sensors.map(() => null)

      for (let co=0; co < sensors_count; co++) {

          const sensor = this.sensors[co]
          const dataset = {
            data: [],
            label: sensor.title || sensor.default_title,
            ...DATASET_TMPLT
          }
          this.chart_data.datasets.push(dataset)
          let total = null
          let total_value = 0
            
          if (sensor.type in sensors_idxs) {
            sensors_idxs[sensor.type]++
          } else {
            sensors_idxs[sensor.type] = 0
          }

          if (sensor.type in SENSOR_TYPE_SETTINGS) {
            Object.assign(dataset, 
                JSON.parse(JSON.stringify(SENSOR_TYPE_SETTINGS[sensor.type].dataset[sensors_idxs[sensor.type]])))
            total = SENSOR_TYPE_SETTINGS[sensor.type].total
          }

          let prev_date = null
          let prev_value = null

          this.chart_options.scales.xAxes[0].time.unit = this.interval.interval.includes('days') ? 'day' : 'hour'

          dataPost('sensor/data', {
            sensor_id: sensor.id,
            interval: this.interval.interval,
            group: this.interval.group
          })
            .then(data => {

              if (data.length) {

                for (const x of data) {
                  
                  if (x.value != null) {
                    if (data_min[co] === null || data_min[co] > x.value) {
                      data_min[co] = x.value
                    }
                    if (data_max[co] === null || data_max[co] < x.value) {
                      data_max[co] = x.value
                    }
                  }

                  const x_date = new Date(x.tstamp)
                  if (this.chart_break_interval && prev_date && x_date - prev_date > this.chart_break_interval) {
                    dataset.data.push({
                      x: new Date(prev_date.getTime() + 30000),
                      y: prev_value
                    })
                    dataset.data.push({
                      x: new Date(x_date.getTime() + this.chart_break_interval / 2),
                      y: NaN
                    })
                  }
                  if (total && prev_date && 
                    (!this.chart_break_interval || x_date - prev_date <= this.chart_break_interval)) {
                    total_value += total.item_value((prev_value + x.value)/2, x_date - prev_date)
                  }

                  prev_date = x_date
                  prev_value = x.value
                  dataset.data.push({
                    x: new Date(x.tstamp),
                    y: x.value
                  })
                }
                dataset.data.push({
                    x: new Date(prev_date.getTime() + 30000),
                    y: prev_value
                })
            }                
            
            ready[co] = true
            if (total) {
              this.total[co] = {
                value: Number(total_value).toFixed(1),
                unit: total.unit
              }
            }
            if (!ready.filter(item => !item).length) {
              data_min = data_min.filter(item => item !== null)
              if (data_min.length) {
                this.chart_options.scales.yAxes[0].ticks.min = Math.floor(Math.min(...data_min)/5)*5
              }
              data_max = data_max.filter(item => item !== null)
              if (data_max.length) {
                this.chart_options.scales.yAxes[0].ticks.max = Math.floor(Math.max(...data_max)/5)*5 + 5
              }
              this.ready = true
            }

           })
        }
    }
  },
  watch: {
    interval () {
      this.render_chart()
    }
  }
}
</script>

<style>

</style>
