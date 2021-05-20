import jsen from 'jsen'

import schemas from '../../public/schemas.json'

import {isEmpty} from '../utils'

const validators = {}
for (const name in schemas) {
  validators[name] = jsen(schemas[name], {greedy: true})
}

export default {
  data () {
    return {
      validationData: {},
      validationSchema: null,
      validationErrors: { dumbField: 1 },
      ignoreFields: ['login', 'token']
    }
  },
  mounted () {
    this.validate()
  },
  methods: {
    validate() {
      const valid = validators[this.validationSchema](this.validationData)
      this.validateCallback(valid, validators[this.validationSchema].errors)
      this.$emit('validation', this.validated, this.validationData)
    },
    validateCallback (valid, errors) {
      this.$set(this, 'validationErrors', {})
      if (!valid) {
          /*
        for (const item of errors) {
          this.$set(this.validationErrors, item.dataPath.substr(1), item.message)
        }*/
        for (const item of errors) {
          if (!this.ignoreFields.includes(item.path)) {
            this.$set(this.validationErrors, item.path, item.keyword)
          }
        }
/*        if (this.validationErrors.recaptcha) {
          this.$refs.recaptcha.execute()
        }*/
      }
    }
  },
  watch: {
    validationData: {
      handler: function () { this.validate() },
      deep: true
    },
    validationSchema: {
      handler: function () {
        const vm = this
        vm.$nextTick(function () {
          vm.validate()
        })
      }
    }
  },
  computed: {
    validated() {
      return isEmpty(this.validationErrors)
    }
  }
}
