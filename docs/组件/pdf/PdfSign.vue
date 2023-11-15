<template>
  <div class="pdf-sign">
    <div class="title">用印位置</div>
    <div class="tips">温馨提醒：系统仅支持A4标准文件，请核对无误后再上传！</div>
    <div class="pdf-sign-container" v-if="file" v-loading="pdfLoading">
      <div class="pdf-area" id="pdfArea">
        <PdfDisplay ref="pdfDisplayRef" @pageChange="pageChange" @pdfLoading="pdfLoadingDone" />

        <!-- 移除原生拖拽，通过鼠标事件处理 draggable="false" -->
        <div v-for="item in signatureInfoList" :key="item._id">
          <!-- 展示页码相同，或者未确定可以拖动的印章 -->
          <div v-if="item.page === currentPage || item.draggable" class="pdf-sign-item"
            @mousedown="e => mousedown(item, e)" :style="getSignStyle(item)">
            <img :src="`${$baseUrl}image/sign/sign-${item.signType}.png`" draggable="false" alt="">
            <div class="pdf-sign-item-btn" v-if="!disabled">
              <el-button type="primary" size="mini" v-if="item.draggable" @click="confirm(item)">确定</el-button>
              <el-button type="primary" size="mini" plain @click="remove(item)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="btn-group">
        <div v-for="item in signTypeDict" :key="item.key">
          <!-- pdf 加载中，或者存在未确定的印章时，显示 -->
          <el-button type="primary" plain small @click="add(item.key)"
            :disabled="pdfLoading || disabled || Boolean(getGroupedListByType(item.key).find(i => i.draggable))">
            {{ item.value }}
          </el-button>
          <div> 使用数：{{ getGroupedListByType(item.key).length }}</div>
        </div>

      </div>
    </div>
    <div v-else class="pdf-sign-empty">
      请上传合同文件
    </div>
  </div>
</template>

<script>
import PdfDisplay from '@/components/PdfDisplay'
import DICT from './DICT'
import { groupBy } from 'lodash'

// A4 595 * 842
// 印章大小为 80*80
const A4_WIDTH = 595
const A4_HEIGHT = 842
const SIGN_SIZE = 80

export default {
  name: 'PdfSign',
  components: { PdfDisplay },
  props: {
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    groupedList() {
      return groupBy(this.signatureInfoList, 'signType')
    }
  },
  mounted() {
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  },
  destroyed() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  },
  activated() {
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  },
  deactivated() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  },
  data() {
    return {
      pdfLoading: false,
      file: null,
      currentPage: 1,
      signTypeDict: DICT.signType.filter(i => !i.disabled), // 右侧按钮枚举
      signatureInfoList: [] // 印章数据
    }
  },
  methods: {
    checkValid() {
      // 找不到可拖拽的印章 为true  否则为false
      return this.signatureInfoList.findIndex(i => i.draggable) === -1
    },
    setFile(file) {
      this.file = file
      this.$nextTick(() => {
        if (this.$refs.pdfDisplayRef) {
          if (file.fileUrl) {
            // 远端下发的绝对路径
            this.$refs.pdfDisplayRef.showPDF(file.fileUrl)
          } else {
            // 本地刚传的
            this.$refs.pdfDisplayRef.loadPDF(file.response)
          }
        }
      })
    },
    clear() {
      this.file = null
      this.signatureInfoList = []
    },
    pageChange(page) {
      this.currentPage = page
      this.signatureInfoList.forEach(i => {
        if (i.status === '0') {
          // 没有确认过的章 更新页码
          i.page = page
        }
      })
      this.$forceUpdate()
    },
    add(signType) {
      const item = this.createNewSign(signType)
      this.signatureInfoList.push(item)
    },
    // 创建一个新的印章
    createNewSign(signType) {
      // A4 595 * 842
      // 印章大小为 80*80
      return {
        _id: this.util.randomString(), // 前端伪造 _id 方便之后判断， 注意不要修改后端返回的id
        signType: signType, // 印章类型
        x: (signType - 3) * 100, // 距离左上角 x的距离
        y: (signType - 3) * 100, // 【重要】 距离左上角 y的距离。【注意】按照易私募规范 往后端发的时候 需要用 842 - y
        page: null, // 无所谓，确定的时候更新，draggable = true的时候 每一页都要展示
        isMouseDown: false,
        draggable: true // true 新创建 （允许确定） false 已确定（允许删除）
      }
    },
    mousedown(item, e) {
      if (item.draggable) {
        item.isMouseDown = true
        item.pageX = e.pageX
        item.pageY = e.pageY
        item.downX = item.x
        item.downY = item.y
      }
    },
    handleMouseMove(e) {
      const index = this.signatureInfoList.findIndex(i => i.isMouseDown)
      if (index >= 0) {
        const item = this.signatureInfoList[index]
        let x = item.downX + e.pageX - item.pageX
        let y = item.downY + e.pageY - item.pageY
        x = Math.max(x, 0)
        x = Math.min(x, A4_WIDTH - SIGN_SIZE)
        y = Math.max(y, 0)
        y = Math.min(y, A4_HEIGHT - SIGN_SIZE)

        this.signatureInfoList[index].x = x
        this.signatureInfoList[index].y = y
      }
    },
    handleMouseUp() {
      this.signatureInfoList = this.signatureInfoList.map(i => {
        return {
          ...i,
          isMouseDown: false
        }
      })
    },
    getSignStyle(item) {
      return {
        left: (16 + item.x) + 'px',
        top: (56 + item.y) + 'px',
        // 后出现的印章 如果已经确定了，就不要响应任何拖拽事件。
        // 避免挡住之前出现的章的按钮
        pointerEvents: item.draggable ? 'auto' : 'none'
      }
    },
    // 确定按钮
    confirm(item) {
      // 当前页面，存在x y 坐标小于2px  视为相同位置印章阻断确定操作
      const sameItem = this.signatureInfoList.find(i => {
        return i._id !== item._id && Math.abs(i.x - item.x) < 2 && Math.abs(i.y - item.y) < 2 && i.page === this.currentPage
      })

      if (sameItem) {
        this.$message.error('同一位置无法放置同一类型用印，请调整后重试！')
      } else {
        item.draggable = false
        item.page = this.currentPage
      }
    },
    // 删除按钮
    remove(item) {
      const index = this.signatureInfoList.findIndex(i => i._id === item._id)
      if (index >= 0) {
        this.signatureInfoList.splice(index, 1)
      }
    },
    // 获取指定印章类型的数组
    getGroupedListByType(key) {
      return this.groupedList[key] || []
    },

    // 后端返回数据转化成渲染数据
    initData(data) {
      this.currentPage = 1
      if (this.util.isEmpty(data)) {
        this.signatureInfoList = []
      }
      this.signatureInfoList = data.map(i => {
        return {
          id: i.id, // 后端入库id
          _id: this.util.randomString(), // 前端伪造 _id 方便之后判断， 注意不要修改后端返回的id
          signType: i.signType, // 印章类型
          x: i.lux, // 距离左上角 x的距离
          y: A4_HEIGHT - i.luy, // 【重要】 距离左上角 y的距离。【注意】按照易私募规范 往后端发的时候 需要用 842 - y
          page: i.page, // 无所谓，确定的时候更新，draggable = true的时候 每一页都要展示
          isMouseDown: false,
          draggable: false // true 新创建 （允许确定） false 已确定（允许删除）
        }
      })
    },

    pdfLoadingDone(loading, pageSize) {
      this.pdfLoading = loading
      if (!loading) {
        // 旧数据可能存在印章盖在pdf最后一页之后，导致无法删除无效印章
        // 因为99%的存量合同都签署过，这里只做前端剔除，作为一个兜底
        this.signatureInfoList = this.signatureInfoList.filter(i => i.page <= pageSize)
      }
    },

    // 返回用于提交的数据
    getSignData() {
      return this.signatureInfoList.map(i => {
        return {
          id: i.id,
          signType: i.signType,
          height: 80,
          width: 80,
          lux: Math.max(Math.floor(i.x), 0),
          luy: Math.min(A4_HEIGHT, Math.floor(A4_HEIGHT - i.y)),
          page: i.page
        }
      })
    }
  }

}
</script>

<style lang="scss" scoped>
.pdf-sign {

  border: 1px solid #dcdfe6;

  .title {
    background-color: #f0f0f0;
    color: #3b3b3b;
    font-weight: 800;
    font-size: 14px;
    line-height: 20px;
    padding: 8px 16px;
  }

  .tips{
    font-size: 12px;
    margin-left: 16px;
    line-height: 20px;
    margin-top: 4px;
  }

  .pdf-sign-container {
    display: flex;
    // justify-content: space-between;

    .pdf-area {
      width: 597px; // borderleft 1px + A4 595px + borderright 1px
      padding: 16px;
      position: relative;

      .pdf-sign-item {
        position: absolute;
        width: 80px;
        height: 80px;
        z-index: 999;
        user-select: none;
        cursor: move;
        display: flex;
        justify-content: center;
        justify-items: center;

        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .pdf-sign-item-btn {
          position: absolute;
          pointer-events: auto;
          top: 82px;
        }
      }
    }

    .btn-group {
      width: 116px;
      padding: 16px;
      font-size: 14px;
      line-height: 28px;
    }
  }

  .pdf-sign-empty {
    text-align: center;
    font-size: 20px;
    line-height: 32px;
    padding: 8px 16px;
    font-weight: 700;
  }
}
</style>
<style lang="scss" >
.pdf-sign-item-btn button.el-button {
  padding: 6px 4px;
}
</style>
