
pdf预览是一个很常见的功能，通常会直接用viewer.html 通过iframe引入，这样会使得修改较繁琐。
本文会告知如何通过vue封装一个这样的组件。[代码参考](./PdfDisplay.vue)

1. 可以将pdfjs-dist 的资源放到一个静态文件服务器下，不用放在代码里面。 然后在index.html中引入并创建worker。

``` html 
<script>
// 指向静态资源pdfjs-dist位置
const p = window.CONFIG.abc + '/pdfjs-dist@3.9.179/build'
let s = document.createElement('script')
s.type = 'text/javascript'
s.src = p +'/pdf.js'
document.body.appendChild(s)

s.onload = s.onreadystatechange = function(){
    window.pdfjsLib = pdfjsLib
    pdfjsLib.GlobalWorkerOptions.workerSrc =  p + '/pdf.worker.js';
}
</script>
```

2. 组件初始化的时候获取到canvas
``` javascript
<div class="pdf-display-canvas">
    <canvas id="pdf-display-preview"></canvas>
</div>

mounted() {
this.preview = document.getElementById('pdf-display-preview')
this.context = this.preview.getContext('2d')
}
```

3. 拿到pdf文件后（支持流、也支持url）
``` javascript
    const loadingTask = window.pdfjsLib.getDocument(url, true)
    loadingTask.promise.then((doc) => {
        // 解析文件成功
        this.pdf = doc 
        this.pageNum = 1
        // ... 一些其他细节
        this.readerPage()
    })
```

4. 渲染 
``` javascript
 readerPage(callback) {
      this.pdf.getPage(this.pageNum).then((page) => {
        const viewport = page.getViewport({ scale: 1 })

        this.preview.height = viewport.height
        this.preview.width = viewport.width

        const renderContext = {
          canvasContext: this.context,
          viewport: viewport
        }
        page.render(renderContext).promise.then(callback)
      })
    }
```

5. destory周期销毁并释放内存 this.pdf.destroy()


6. 拖动逻辑
- 子绝父相的定位
- mousedown时，记下按下位置，标记按下的元素
- mousemove时，找到之前按下的元素，计算拖动后的坐标，并对范围进行修正
- 根据x，y坐标，触发style更新
- mouseup时，移除按下元素的标记