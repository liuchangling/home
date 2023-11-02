# FullPathKeepAlive 组件
本文描述了一个很有意思的问题，分享一下排查问题的思路和解决办法。

## 一、遇到的问题
发现d2-admin 动态路由+keepalive 的页面打开多个后，发现两个问题
1. 关闭之后，内存未释放，组件依然被缓存了。
2. 关闭再重开，缓存内容不对。

## 二、深挖背景及原因
1. keep-alive的原理，就是用一个对象存储了数据，数据结构是key-value格式，可以通过key进行过滤。但key仅支持name，不支持fullpath。 因为keep-alive设计本意是支持所有组件，所以选择了name作为key。而fullpath是vue-router里面的东西，设计vue时不会使用fullpath作为key进行缓存。
2. d2admin的layout.vue。d2admin的设计中，使用keepAlive存储所有需要缓存的组件name。只有name在keepAlive数组中的组件才会被缓存
```javascript
<keep-alive :include="keepAlive">
    <router-view :key="$router.history.current.fullPath" />
</keep-alive>
```

3. 动态路由fullPath不同而名字相同。
```javascript
{
      path: 'example/detail/:id',
      name: `example-detail`,
}
```
4. src\store\modules\d2admin\modules\page.js   
d2admin的设计中，使用keepAlive存储所有需要缓存的组件name 。 
在添加页面时，在keepAlive数组中加入该页面name
```javascript
 /**
     * @class opened
     * @description 新增一个 tag (打开一个页面)
     * @param {Object} context
     * @param {Object} payload new tag info
     */
    add ({ state, commit, dispatch }, { tag, params, query, fullPath }) {
      return new Promise(async resolve => {
        // 设置新的 tag 在新打开一个以前没打开过的页面时使用
        let newTag = tag
        newTag.params = params || newTag.params
        newTag.query = query || newTag.query
        newTag.fullPath = fullPath || newTag.fullPath
        // 添加进当前显示的页面数组
        state.opened.push(newTag)
        // 如果这个页面需要缓存 将其添加到缓存设置
        if (isKeepAlive(newTag)) {
          commit('keepAlivePush', tag.name)
        }
        // 持久化
        await dispatch('opened2db')
        // end
        resolve()
      })
    },
```

在删除页面时，找到name之后基于index，从keepAlive数组中删掉对应项，导致了删除错误。

```javascript
 /**
 * @description 删除一个页面的缓存设置
 * @param {Object} state state
 * @param {String} name name
 */
keepAliveRemove (state, name) {
  const list = [ ...state.keepAlive ]
  const index = list.findIndex(item => item === name)

  if (index !== -1) {
    list.splice(index, 1)
    state.keepAlive = list
  }
},
```
结合以上背景可以得出以下结论：
1. 如果每个组件name都不同时，d2-admin的路由设计没有问题。
2. 如果使用了动态路由，出现了一个name多个组件的情况，缓存的值不对，且删除时未释放内存。


## 三、解决办法
1. FullPathKeepAlive组件
  写一个以路由 fullpath为 key 的[缓存组件](./FullPathKeepAlive.js)
2. 修改Layout.vue
在 src\layout\header-aside\layout.vue中引用FullPathKeepAlive组件， 然后将路由缓存修改为
```javascript
<FullPathKeepAlive :include="keepAlive.map(i=>i.fullPath)" ref="keepAlive">
  <router-view :key="$route.fullPath" />
</FullPathKeepAlive>
```
3. 修改vuex中对于page的处理 略


参考 https://zhuanlan.zhihu.com/p/269385782