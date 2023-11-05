class Compile {
	constructor(el, vm) {
		this.$el = el
		this.$vm = vm

		let fragment = this.dom2Mem()

		// add watcher

		this.mem2Dom(fragment)
	}

	dom2Mem() {
		let fragment = document.createDocumentFragment()
		while (this.$el.firstChild) {
			let childAfterCompile = this.compile(this.$el.firstChild)

			fragment.appendChild(childAfterCompile)
		}
		return fragment
	}

	mem2Dom(fragment) {
		this.$el.appendChild(fragment)
	}


	compile(node) {
		if (Util.isNode(node)) {
			return this.compileNode(node)
		} else {
			return this.compileText(node)
		}
	}

	compileNode(node) {
		let attrs = node.attributes
		Object.keys(attrs).forEach(key => {
			//TODO 处理指令中的值
			let name = attrs[key].name
			if (name.includes('v-')) {
				let [, directive] = name.split('v-')
				this.compileDirective(directive, node, attrs[key].value)
			}
		})
		node.childNodes.forEach(n => this.compile(n))

		return node
	}

	compileText(node) {
		const reg = /\{\{([^}]*)\}\}/
		if (reg.test(node.textContent)) {
			this.update(node)
		}

		return node
	}

	compileDirective(directive, node, expr) {
		if (directive === 'model') {
			this.update(node, expr);
		}
	}

	update(node, expr) {
		if (Util.isNode(node)) {
			let newValue = Util.getValue(expr, this.$vm.$data)
			new Watcher(this.$vm, expr, (newValue, oldValue) => {
				console.log('Node change --- new:', newValue, 'old', node.value)
				node.value = newValue
			})
			node.value = newValue

			node.addEventListener('input', e => {
				let nv = e.target.value
				Util.setValue(expr, this.$vm.$data, nv)
			})

		} else {
			const reg = /\{\{([^}]*)\}\}/
			let newValue = node.textContent.replace(reg, (match, e) => {
				expr = e
				return Util.getValue(e, this.$vm.$data)
			})
			new Watcher(this.$vm, expr, (newValue, oldValue) => {
				console.log('Text change --- new:', newValue, 'old', node.textContent)
				node.textContent = newValue
			})
			node.textContent = newValue
		}
	}

}
