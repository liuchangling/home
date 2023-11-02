<!-- 本组件用于用印盖章，支持pdf预览功能，每屏显示完整一页。pdfjsLib 版本= 3.9.179 从minio获取 -->
<template>
  <div class="pdf-display" v-loading="loading">
    <div class="pdf-display-pagination">
      <!-- page-size="1" 用1页作为分页参数 -->
      <el-pagination layout="prev,pager,next,jumper" :total="total" :current-page="pageNum"
        @current-change="handleCurrentChange" prev-text="上一页" next-text="下一页" :page-size="1">
      </el-pagination>
    </div>

    <div class="pdf-display-canvas">
      <canvas id="pdf-display-preview"></canvas>
    </div>

  </div>
</template>

<script>
const SCALE = 1
export default {
  name: 'PdfDisplay',
  data() {
    return {
      preview: null,
      context: null,
      pdfFile: null, // pdf文件
      pdf: null, // 用于渲染的pdf
      pageNum: 1, // 当前页数
      total: 1, // 总页数
      loading: false
    }
  },
  mounted() {
    this.preview = document.getElementById('pdf-display-preview')
    this.context = this.preview.getContext('2d')
  },
  watch: {
    loading(v) {
      this.$emit('pdfLoading', v, this.total)
    }
  },
  methods: {
    // 这里传入的是el-upload的file，比原生input的多了一层，所以需要解构
    loadPDF(file) {
      this.pdfFile = file
      const reader = new FileReader()
      reader.onload = (e) => this.showPDF(e.target.result)
      reader.readAsDataURL(file)
    },
    showPDF(url) {
      this.context.width = 595
      this.context.height = 842
      if (this.loading) return
      this.loading = true

      // 在index.html中 通过创建script标签引入。挂载到window上
      const loadingTask = window.pdfjsLib.getDocument(url, true)
      loadingTask.promise.then((doc) => {
        this.pdf = doc
        this.total = doc._pdfInfo.numPages
        this.pageNum = 1
        this.loading = false
        this.readerPage()
      }, (reason) => {
        this.$message.error(reason)
      })
    },
    handleCurrentChange(v) {
      this.pageNum = v
      this.$emit('pageChange', v) // 业务层处理页面变更
      this.readerPage()
    },
    readerPage(callback) {
      this.pdf.getPage(this.pageNum).then((page) => {
        const scale = SCALE
        const viewport = page.getViewport({ scale: scale })

        this.preview.height = viewport.height
        this.preview.width = viewport.width

        const renderContext = {
          canvasContext: this.context,
          viewport: viewport
        }
        page.render(renderContext).promise.then(callback)
      })
    }

  },
  destroyed() {
    try {
      this.pdfFile = null
      this.context = null
      this.preview = null
      this.pdf.destroy()
      this.pdf = null
    } catch (error) {

    }
  }
}
</script>

<style lang="scss" scoped>
.pdf-display {
  .pdf-display-pagination {
    text-align: center;
  }

  .pdf-display-canvas {
    width: 595px;
    height: 842px;
    margin: 8px 0;
    border: 1px dashed #dcdfe6;
  }
}
</style>
