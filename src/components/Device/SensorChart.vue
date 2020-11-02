<template>
    <div class="lk_sensor_graf">
        <line-chart v-if="ready" :chart_data="chart_data" :options="chart_options">
        </line-chart>
    </div>
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
  spanGaps: false
}

export default {
  name: 'SensorChart',
  components: {LineChart},
  props: ['sensors'],
  data () {
    return {
      ready: false,
      chart_data: {
        datasets: []
      },
      chart_options: {
		responsive: true,
		maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              tooltipFormat: 'HH:mm',
              displayFormats: {
                hour: 'HH:mm',
				minute: 'HH:mm'
              }
            }
          }],
          yAxes: [{
            ticks: {}
          }]
        }
      }
    }
  },
  async mounted () {
    const end = new Date()
    const begin = new Date()
    begin.setDate(begin.getDate() - 1)

    const sensors_idxs = {}
    const ready = this.sensors.map(() => false)
    const sensors_count = this.sensors.length
    let data_min = null
    let data_max = null

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
          begin: strftime('%Y-%m-%d %H:%M:%S', begin),
          end:  strftime('%Y-%m-%d %H:%M:%S', end)
        })
          .then(data => {

            for (const x of data) {

              if (data_min === null || data_min > x.value)
                data_min = x.value
              if (data_max === null || data_max < x.value)
                data_max = x.value
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
            
            ready[co] = true
            if (!ready.filter(item => !item).length) {
              this.chart_options.scales.yAxes[0].ticks.min = Math.floor(data_min/5)*5
              this.chart_options.scales.yAxes[0].ticks.max = Math.floor(data_max/5)*5 + 5
              this.ready = true
            }

        })
      }
  }
}
</script>

<style>

</style>
