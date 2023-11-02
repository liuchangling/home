<!-- 实现两层的树的虚拟滚动 -->
<template>
  <Tree v-bind="$attrs" v-on="$listeners" ref="ElTree" :style="{ maxHeight: visualHeight + 'px' }" :data="data"
    class="virtal-tree-l2" @node-expand="handleScroll" @node-collapse="handleScroll" :treeItemSize="treeItemSize">
  </Tree>
</template>

<script>
import Tree from './Tree'
import { debounce } from 'lodash'

export default {
  name: 'VirtualTreeL2',
  inheritAttrs: false,
  components: {
    Tree
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    // 视口高度
    visualHeight: {
      type: Number,
      required: true
    },
    // 每个树节点的高度，必须一致。
    // 不支持一级二级高度不同的场景
    // 修改高度时，需要同步改el-tree-node__content样式的height
    treeItemSize: {
      type: Number,
      required: false,
      default: 32
    },
    // 缓冲区节点数量
    bufferCount: {
      type: Number,
      required: false,
      default: 30
    },
    // 默认宽度
    defaultWidth: {
      type: String,
      required: false,
      default: '400px'
    }
  },
  data() {
    return {
      visibleStartIndex: 0, // 可见节点的起始索引
      visibleEndIndex: 200, // 可见节点的结束索引
      handleScroll: debounce(this.scroll, 50)
    }
  },
  computed: {
    totalLength() {
      let index = 0
      this.data.forEach(item => {
        index++
        let node = this.$refs.ElTree.getNode(item[this.$attrs['node-key']])
        if (node?.childNodes?.length > 0) {
          index = index + node.childNodes.length
        }
      })
      return index
    }
  },

  methods: {
    // 数据变更时，外层需要在nextTick中调用 this.$refs.tree.scroll()，命令组件更新visual index
    // 滚动事件监听器
    scroll() {
      this.getVisualRange()
      // 由于源码中 监听的expanded在nextTick中更新，这里需要再两次后更新
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.updateVisual()
        })
      })
    },

    // 更新每个节点可见的index
    updateVisual() {
      const start = Math.max(this.visibleStartIndex - this.bufferCount, 0)
      const end = Math.min(this.visibleEndIndex + this.bufferCount, this.totalLength - 1)

      let index = -1
      this.data.forEach(item => {
        // 遍历一级节点
        index++
        let node = this.$refs.ElTree.getNode(item[this.$attrs['node-key']])
        this.$set(node, 'visual', start <= index && index <= end)
        if (node?.childNodes?.length > 0) {
          if (node.expanded) {
            node.childNodes.forEach((child, idx) => {
              // 父级展开时，继续遍历二级节点
              index++
              this.$set(child, 'visual', start <= index && index <= end)
            })
          } else {
            // 父级收起时，子级不可见
            node.childNodes.forEach((child, idx) => {
              this.$set(child, 'visual', false)
            })
          }
        }
      })
    },

    // 获取可见节点的起始索引和结束索引
    getVisualRange() {
      const itemSize = this.treeItemSize
      const visibleCount = Math.ceil(this.visualHeight / itemSize)
      this.visibleStartIndex = Math.floor(this.$refs.ElTree.$el.scrollTop / itemSize)
      this.visibleEndIndex = this.visibleStartIndex + visibleCount - 1
    }
  },

  mounted() {
    const el = this.$refs.ElTree.$el
    el && el.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    const el = this.$refs.ElTree.$el
    el && el.removeEventListener('scroll', this.handleScroll)
  },
  activated() {
    const el = this.$refs.ElTree.$el
    el && el.addEventListener('scroll', this.handleScroll)
  },
  deactivated() {
    const el = this.$refs.ElTree.$el
    el && el.removeEventListener('scroll', this.handleScroll)
  }
}
</script>

<style lang="scss">
.virtal-tree-l2 {
  overflow-y: auto;
  width: 100%;

  // 滚动条样式
  &::-webkit-scrollbar-track {
    @include backgroundColor(A11);
  }

  .el-tree-node__content {
    height: 32px;
    @include backgroundColor(A11);
  }

  span.el-tree-node__label {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .custom-tree-node {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  // 暂无数据
  .el-tree__empty-block {
    @include backgroundColor(A11);
  }

  div.el-tree-node {

    div.el-tree-node__content:hover,
    div.el-tree-node:focus,
    div.el-tree-node:focus>div.el-tree-node__content {
      @include backgroundColor(A2h);
      @include color(A6);
    }

    div.el-tree-node__content{
      @include color(A6);
    }
  }

  div.el-tree-node.is-checked {

    div.el-tree-node__content:hover,
    div.el-tree-node:focus,
    div.el-tree-node:focus>div.el-tree-node__content {
      @include backgroundColor(A2h);
      @include color(A10);
    }

    div.el-tree-node__content{
      @include color(A10);
    }
  }
}
</style>
