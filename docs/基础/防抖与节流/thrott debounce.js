f = console.log

// 防抖 debounce
// 所谓防抖，就是指触发事件后在 n 秒内函数只能执行一次，如果在 n 秒内又触发了事件，则会重新计算函数执行时间
// return 一个函数
// 即用户不在动了，再执行。

var d = debounce(f, 2000);
d(1,2,3,4); //多次运行该函数验证.

// 非立即执行 定时器版
// 闭包里面有一个timer值,
// 返回函数中 如果有timer,则清空,如果没有则启动一个新的定时器

function debounce(f, time){
	let timer;
	 
	return function(){
		let args = arguments;
		let context = this;		
		
		// 如果之前有定时器，说明用户又触发了，那就取消之前的定时器。
		if(timer) clearTimeout(timer);
				
		timer = setTimeout(()=>{
			f.apply(context, args);
		}, time)			
	}
}


// 立即执行 时间戳版。先执行,多长时间内无新操作的话 再次执行触发
function debounce(f, time){
	let lastRunTime;
		
	return function(){
		let now = Date.now()
		if(!lastRunTime || now - lastRunTime > time){ // 首次执行或者距离上次调用时间已超过time
			// lastRunTime = now; // 在这里更新时间就是throttle，看下面，括号外无修改时间。
			f.apply(this, arguments);
		}
		lastRunTime = now; // 记录的时间是用户上次调用的时间
	}
}

var t = throttle(f, 2000);
t(5,6,7,8)
// 节流 throttle
// 所谓节流，就是指连续触发事件但是在 n 秒中只执行一次函数。节流会稀释函数的执行频率。
// 立即执行 时间戳版

function throttle(f, time){
	let lastRunTime;
	
	return function(){
		let now = Date.now();
		if(!lastRunTime || now - lastRunTime > time){ // 首次执行或者距离上次执行已超出时间间隔
			lastRunTime = now; // 总是记录上次执行时间
			f.apply(this, arguments);
		}
		// 这里更新时间就是debounce， 区别是更新调用时间还是执行时间
	}
}

// 延迟执行 定时器版。
function throttle(f, time){
	let timer;
	
	return function(){
		let args = arguments;
		let context = this;

		if(timer) return // 唯一区别， 已有计时器说明非首次执行，上一次定时器未完成时 直接跳过
		// 启动定时器，时间到的时候执行
		timer = setTimeout(function(){
			timer = null  // 把定时器置null
			f.apply(context, args) // 执行
		}, time)
		
	}
}