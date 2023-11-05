class MVVM{
	constructor(options) {
	    this.$data = options.data
		this.$el = this.getElement(options.el)
		
		if(this.$el){
			// 数据劫持，将对象的属性转成setter & getter
			new Observer(this.$data);
			
			// 用数据和元素进行编译
			new Compile(this.$el, this)
		}
	}
	
	getElement(node){
		if(Util.isNode(node)){
			return node
		} else{
			return document.querySelector(node)
		}
	}
}