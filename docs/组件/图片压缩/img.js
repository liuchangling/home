// 基于canvas toDataURL 实现压缩
function compressUpload(image, file) {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    let { width, height } = image
    canvas.width = width
    canvas.height = height
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, width, height)

    // 最小压缩0.1， 这里用0.2压缩到500KB左右  0.1可以压缩到400KB左右
    let compressData = canvas.toDataURL(file.type || 'image/jpeg', 0.2)

    // 压缩后调用方法进行base64转Blob，方法写在下边
    let blobImg = dataURItoBlob(compressData)
    // file api不支持IE
    // return new window.File([blobImg], file.name || '', { type: file.type || 'image/jpeg' })
    blobImg.lastModifiedDate = new Date()
    blobImg.name = file.name
    // 如果用了这个方法  这么传参 formData.append('file', blobImgFile.file, blobImgFile.name)
    return {
        file: blobImg,
        name: file.name
    }
}




/* base64转Blob对象 */
function dataURItoBlob(data) {
    let byteString
    if (data.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(data.split(',')[1])
    } else {
        byteString = unescape(data.split(',')[1])
    }

    let mimeString = data
        .split(',')[0]
        .split(':')[1]
        .split(';')[0]
    let ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ia], { type: mimeString })
}


// 用法
let formData = new FormData()
// ....
if (image && params.file.size > FILE_SIZE_LIMIT / 10) {
    image.onload = () => {
        let blobImgFile = compressUpload(image, params.file)
        formData.append('file', blobImgFile.file, blobImgFile.name)
    }
} else {
    formData.append('file', params.file)
}
// ...
// 上传
upload(formData)