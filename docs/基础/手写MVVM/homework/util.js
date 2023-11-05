class Util {
	static isNode(node) {
		return node && node.nodeType === 1
	}

	// a.b.c 将会返回c的值
	static getValue(expr, data) {
		if (!expr) return undefined
		return expr.split('.').reduce((prev, next) => {
			return prev[next]
		}, data)
	}

	static setValue(expr, data, value) {
		if (!expr) return undefined
		let array =  expr.split('.')
		
		array.reduce((prev, next, cur) => {
			if (cur === array.length - 1) {
				return prev[next] = value
			}
			return prev[next]
		}, data)
	}

	static curWatch(watcher) {
		if (watcher) {
			this.watcher = watcher
		}

		return this.watcher
	}
}
