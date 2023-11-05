class Compile {
	constructor(el, vm) {
		this.el = this.isElementNode(el) ? el : document.querySelector(el) //  #app or document.query...
		this.vm = vm

		if (this.el) {
			// 1. 把真实DOM移入内存 fragment
			let fragment = this.node2fragment(this.el)
			// 2. 编译=> 提取想要的元素节点 v-model 和文本节点{{}}
			this.compile(fragment)
			// 3. 把编译好的fragement放到页面中
			this.el.appendChild(fragment)
		}
	}

	// 专门写一些辅助方法
	isElementNode(node) {
		return node.nodeType === 1
	}


	// 核心方法
	node2fragment(el) { // 将el内容全部存入内存
		// 文档碎片
		// 文档中节点添加到文档碎片中，就会从文档树中移除该节点，加入内存中
		// 浏览器中不会在看到该节点，
		let fragement = document.createDocumentFragment()
		while (el.firstChild) {
			fragement.appendChild(el.firstChild)
		}
		return fragement

	}

	compile(fragment) {
		let childNodes = fragment.childNodes;
		// console.log(childNodes);
		Array.from(childNodes).forEach(node => {
			if (this.isElementNode(node)) {
				// 元素节点
				// console.log('element', node)
				this.compileElement(node)
				this.compile(node)
			} else {
				// 文本节点
				// console.log('text', node)
				// 编译文本
				this.compileText(node)
			}
		})
	}


	compileElement(node) {
		// v-model
		let attrs = node.attributes;

		Array.from(attrs).forEach(attr => {
			// console.log(attr)
			if (this.isDirective(attr.name)) {
				// 取值，插入到节点中
				// node this.vm.$data expr
				let expr = attr.value;
				let [pre, type] = attr.name.split('-')
				if (pre === 'v') {
					CompileUtil[type](node, this.vm, expr)
				}
			}
		})
	}

	isDirective(name) {
		return name.includes('v-')
	}

	compileText(node) {
		// {{}}
		let text = node.textContent
		// console.log(text)
		let reg = /\{\{([^}]*)\}\}/g
		if (reg.test(text)) {
			// node this.vm.$data text
			CompileUtil['text'](node, this.vm, text)
		}
	}
}

CompileUtil = {
	getVal(vm, expr) {
		expr = expr.split('.') // a,b,c,d
		return expr.reduce((prev, next) => {
			return prev[next]
		}, vm.$data)
	},

	setVal(vm, expr, value) {
		expr = expr.split('.')
		return expr.reduce((prev, next, cur) => {
			if (cur === expr.length - 1) {
				return prev[next] = value
			}
			return prev[next]
		}, vm.$data)
	},

	getTextVal(vm, expr) {
		return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
			return this.getVal(vm, arguments[1])
		})
	},
	
	text(node, vm, expr) {
		let updateFn = this.updater['textUpdater']
		// 处理差值表达式
		let value = this.getTextVal(vm, expr)
		expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
			// 响应式1 编译时添加到watcher
			new Watcher(vm, arguments[1], (newValue, oldValue) => {
				console.log('watcher call back trigger')
				updateFn && updateFn(node, this.getTextVal(vm, expr))
			})
		})

		updateFn && updateFn(node, value)
	},

	model(node, vm, expr) {
		let updateFn = this.updater['modelUpdater']
		// 响应式1 编译时添加到watcher
		// 监控这里，数据变化时，调用watch的callback
		new Watcher(vm, expr, (newValue, oldValue) => {
			// 值变化后，调用cb，将新的值传进来
			console.log('watcher call back trigger')
			updateFn && updateFn(node, this.getVal(vm, expr))
		})

		// 响应式4 当eventlistener change的时候,会触发value的set方法
		node.addEventListener('input', e => {
			let newValue = e.target.value
			this.setVal(vm, expr, newValue)
		})

		updateFn && updateFn(node, this.getVal(vm, expr))
	},

	updater: {
		// 文本更新
		textUpdater(node, value) {
			node.textContent = value
		},
		// 输入框更新
		modelUpdater(node, value) {
			node.value = value;
		}
	}
}
