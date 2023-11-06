import JyDatePicker from './src/picker/date-picker'

/* istanbul ignore next */
JyDatePicker.install = function install(Vue) {
  Vue.component(JyDatePicker.name, JyDatePicker)
}

export default JyDatePicker
