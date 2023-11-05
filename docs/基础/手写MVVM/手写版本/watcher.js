// 观察者的目的是给需要变换的元素增加观察者，
// 当数据变化时，执行对应的方法
// vm.$watch(vm, 'a', function(newVal, oldVal){})
class Watcher {
	constructor(vm, expr, cb) {
		this.vm = vm
		this.expr = expr
		this.cb = cb

		// old value 
		this.value = this.addIntoWatcher();
	}

	addIntoWatcher() {
		// 响应式3 用Dep.target临时记录watcher, 调用getVal的时候回触发get方法中的订阅
		Dep.target = this;
		let value = this.getVal(this.vm, this.expr)
		Dep.target = null;
		return value;
	}

	// 对外暴露的方法
	update() {
		let newValue = this.getVal(this.vm, this.expr)
		let oldValue = this.value;
		if (newValue != oldValue) {
			// 响应式9 执行监听器回调函数
			this.cb(newValue, oldValue) // 类似vue的watch callback
		}
	}

	getVal(vm, expr) {
		expr = expr.split('.') // a,b,c,d
		return expr.reduce((prev, next) => {
			return prev[next]
		}, vm.$data)
	}
}
