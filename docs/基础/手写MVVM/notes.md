# 如何仿Vue写一个MVVM的框架

## Vue的双向绑定
1. Compile 模板的编译（{{}} 和 v-的处理）
2. Observer 数据劫持 （观察数据变化）
3. Watcher 观察者 