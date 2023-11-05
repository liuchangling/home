class MVVM {
	constructor(options) {
		this.$el = options.el
		this.$data = options.data

		if (this.$el) {
			// 数据劫持，把对象的所有属性，改成getter和setter
			new Observer(this.$data)
			// 设置this.$data.message 和 this.message同一个值
			this.proxyData(this.$data)
			// 用数据和元素进行编译
			new Compile(this.$el, this)
		}
	}

	proxyData(data) {
		Object.keys(data).forEach(key => {
			Object.defineProperty(this, key, {
				get() {
					return data[key]
				},
				set(newValue) {
					data[key] = newValue
				}
			})
		})
	}
}
