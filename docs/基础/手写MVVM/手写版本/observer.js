class Observer {
	constructor(data) {
		this.observe(data)
	}

	observe(data) {
		// data => setter + getter
		if (!data || typeof data !== 'object') {
			return
		}

		Object.keys(data).forEach(key => {
			this.defineReactive(data, key, data[key])
			this.observe(data[key]) // 劫持
		})
	}

	// 定义响应式
	defineReactive(obj, key, value) {
		console.log(value)
		let that = this;
		// 每个变化的数据，都会对应一个数组，这个数组是存放所有更新的操作
		let dep = new Dep()
		Object.defineProperty(obj, key, {
			enumerable: true,
			configureable: true,
			get() {
				// 响应式2 调用属性get的时候，会订阅Dep.target 。所以我们在get前后临时赋值Dep.target
				Dep.target && dep.addSub(Dep.target)
				return value
			},
			set(newValue) {
				// 响应式5 当eventlistener触发此get方法
				if (newValue != value) {
					that.observe(newValue) // 劫持
					value = newValue
					// 响应式6 通知数据变更
					dep.notify()
				}
			}
		})
	}
}

class Dep {
	constructor() {
		// 订阅的数组
		this.subs = []
	}

	addSub(watcher) {
		this.subs.push(watcher)
	}

	notify() {
		// 响应式7 执行变更
		this.subs.forEach(watcher => {
			// 响应式8 触发监听器更新
			watcher.update()
		})
	}
}
