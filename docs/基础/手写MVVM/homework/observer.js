class Observer {
	constructor(data) {
		this.observe(data)
	}

	observe(data) {
		if (!data || typeof data !== "object") {
			return
		}

		Object.keys(data).forEach(key => {
			this.defineReactive(data, key, data[key])
			this.observe(data[key])
		})
	}

	defineReactive(data, key, value) {
		// 每个变化的数据，都会对应一个数组，这个数组是存放所有更新的操作
		let sub = new Subscriber()
		let that = this
		
		Object.defineProperty(data, key, {
			get() {
				if (Util.curWatch()) {
					sub.addSub(Util.curWatch())
				}
				return value
			},
			set(newValue) {
				if(newValue !== value){
					that.observe(newValue)					
					value = newValue
					sub.notify()
				}
			}
		})
	}
}
