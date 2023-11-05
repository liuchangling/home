class Watcher {
	constructor(vm, expr, callback) {
		this.$vm = vm
		this.$expr = expr
		this.$callback = callback

		this.value = this.getOldValue()
	}

	getOldValue() {
		Util.curWatch(this)
		let oldValue = Util.getValue(this.$expr, this.$vm.$data)
		Util.curWatch(null)
		return oldValue
	}

	update() {
		let newValue = Util.getValue(this.$expr, this.$vm.$data)
		let oldValue = this.value

		if (newValue !== oldValue) {
			this.$callback(newValue, oldValue)
		}
	}
}
