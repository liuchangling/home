<!-- 改动较大，因为源码的JSX语法不支持使用指令，所以改写为template语法，方便使用v-infinite-scroll -->
<template>
  <div style="max-height: 300px; overflow-y: auto;" :style="{width: defaultWidth}">
    <ul tag="ul" role="menu" :id="menuId" class="el-cascader-menu infinite-list el-scrollbar__wrap"
      wrap-class="el-cascader-menu__wrap" :view-class="[{ 'el-cascader-menu__list': true, 'is-empty': isEmpty }]"
      @mousemove="handleMouseMove" v-infinite-scroll="loadMore" infinite-scroll-distance="10"
      infinite-scroll-immediate="false">
      <li v-if="isEmpty" class="el-cascader-menu__empty-text el-cascader-node">
        <span v-if="base.loading">
          加载中...
        </span>
        <span class="red" v-else>
          {{ t('el.cascader.noMatch') }}
        </span>
      </li>
      <li v-else>
        <cascader-node v-for="(node, index) in nodes" :key="node.uid" :node="node" :node-id="`${menuId}-${index}`"
          :aria-haspopup="node.hasChildren" :aria-owns="node.hasChildren ? menuId : null" :title="node.label"
          v-on="panel.isHoverMenu ? { expand: handleExpand } : {}"  class="el-cascader-node__label"/>
      </li>
      <svg v-if="panel.isHoverMenu" ref="hoverzone" class="el-cascader-menu__hover-zone"></svg>
    </ul>
  </div>
</template>

<script>

import CascaderNode from 'element-ui/packages/cascader-panel/src/cascader-node.vue'
import Locale from 'element-ui/src/mixins/locale'
import { generateId } from 'element-ui/src/utils/util'

export default {
  name: 'PortofolioCascaderMenu',
  mixins: [Locale],

  inject: ['panel', 'base'],
  components: {
    CascaderNode
  },

  props: {
    nodes: {
      type: Array,
      required: true
    },
    defaultWidth: String,
    index: Number
  },

  data() {
    return {
      activeNode: null,
      hoverTimer: null,
      id: generateId()
    }
  },

  computed: {
    isEmpty() {
      return !this.nodes.length
    },
    menuId() {
      return `cascader-menu-${this.id}-${this.index}`
    }
  },
  methods: {
    handleExpand(e) {
      this.activeNode = e.target
    },
    handleMouseMove(e) {
      const { activeNode, hoverTimer } = this
      const { hoverZone } = this.$refs

      if (!activeNode || !hoverZone) return

      if (activeNode.contains(e.target)) {
        clearTimeout(hoverTimer)

        const { left } = this.$el.getBoundingClientRect()
        const startX = e.clientX - left
        const { offsetWidth, offsetHeight } = this.$el
        const top = activeNode.offsetTop
        const bottom = top + activeNode.offsetHeight

        hoverZone.innerHTML = `
          <path style="pointer-events: auto;" fill="transparent" d="M${startX} ${top} L${offsetWidth} 0 V${top} Z" />
          <path style="pointer-events: auto;" fill="transparent" d="M${startX} ${bottom} L${offsetWidth} ${offsetHeight} V${bottom} Z" />
        `
      } else if (!hoverTimer) {
        this.hoverTimer = setTimeout(this.clearHoverZone, this.panel.config.hoverThreshold)
      }
    },
    clearHoverZone() {
      const { hoverZone } = this.$refs
      if (!hoverZone) return
      hoverZone.innerHTML = ''
    },
    loadMore() {
      // 丢给外层统一处理
      this.base.loadMore()
    }
  }
}
</script>
