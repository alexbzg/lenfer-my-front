<template>
    <line-chart css-classes="lk_sensor_graf" v-if="ready" 
        :chart_data="chart_data" :options="chart_options">
    </line-chart>
</template>

<script>
import strftime from 'strftime'

import {dataPost} from '../../api'
import LineChart from '../LineChart'

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
  }
}

const DATASET_TMPLT = {
  borderWidth: 3,
  pointRadius: 0,
  pointHitRadius: 0.4,
  spanGaps: false
}

export default {
  name: 'SensorChart',
  components: {LineChart},
  props: ['sensors', 'interval'],
  data () {
    return {
      ready: false,
      chart_data: {
        datasets: []
      },
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
            time: {
              unit: 'hour',
              stepSize: 1,           
              tooltipFormat: 'HH:mm',
              displayFormats: {
                hour: 'HH:mm',
				minute: 'HH:mm'
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
      const data_min = this.sensors.map(() => null)
      const data_max = this.sensors.map(() => null)
      this.chart_data.datasets = []

      for (let co=0; co < sensors_count; co++) {

          const sensor = this.sensors[co]
          const dataset = {
            data: [],
            label: sensor.title || sensor.default_title,
            ...DATASET_TMPLT
          }
          this.chart_data.datasets.push(dataset)
            
          if (sensor.type in sensors_idxs) {
            sensors_idxs[sensor.type]++
          } else {
            sensors_idxs[sensor.type] = 0
          }

          if (sensor.type in SENSOR_TYPE_SETTINGS) {
            Object.assign(dataset, SENSOR_TYPE_SETTINGS[sensor.type].dataset[sensors_idxs[sensor.type]])
          }

          let prev_date = null

          dataPost('sensor/data', {
            sensor_id: sensor.id,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            begin: strftime('%Y-%m-%d %H:%M:%S', this.interval[0]),
            end:  strftime('%Y-%m-%d %H:%M:%S', this.interval[1])
          })
            .then(data => {

              if (data.length) {

                for (const x of data) {

                  if (data_min[co] === null || data_min[co] > x.value) {
                    data_min[co] = x.value
                  }
                  if (data_max[co] === null || data_max[co] < x.value) {
                    data_max[co] = x.value
                  }
                  const x_date = new Date(x.tstamp)
                  if (prev_date && x_date - prev_date > 600000) {
                    dataset.data.push({
                      x: new Date(x_date.getTime() + 300000),
                      y: NaN
                    })
                  }
                  prev_date = x_date
                  dataset.data.push({
                    x: new Date(x.tstamp),
                    y: x.value
                  })
                }
            }                
            
            ready[co] = true
            if (!ready.filter(item => !item).length) {
              if (data_min.length) {
                this.chart_options.scales.yAxes[0].ticks.min = Math.floor(Math.min(...data_min)/5)*5
              }
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
