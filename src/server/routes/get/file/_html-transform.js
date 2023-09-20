/**
 * Not used, but an example Transform of some string contents
 */

// import { Transform } from 'stream'

// class AddBaseTagTransform extends Transform {
//   constructor(options) {
//     super(options)
//     this.bufferedContent = ''
//     this.headProcessed = false
//     this.basePath = options.resource.pathname

//     if (!this.basePath.endsWith('/')) {
//       this.basePath += '/'
//     }
//   }

//   _transform(chunk, encoding, callback) {
//     this.bufferedContent += chunk.toString()

//     if (!this.headProcessed) {
//       const headEndIndex = this.bufferedContent.indexOf('</head>')

//       // If the closing head tag is found in the buffered content.
//       if (headEndIndex !== -1) {
//         const headRegex = /<head[^>]*>/i
//         const hasBaseTag = this.bufferedContent.includes('<base ')

//         if (!hasBaseTag) {
//           this.bufferedContent = this.bufferedContent.replace(
//             headRegex,
//             match => `${match}\n<base href="${this.basePath}">`,
//           )
//         }

//         // Push the content up to the closing head tag and retain the rest.
//         this.push(this.bufferedContent.substring(0, headEndIndex + 7))
//         this.bufferedContent = this.bufferedContent.substring(headEndIndex + 7)
//         this.headProcessed = true
//       }
//     } else {
//       // If the head section is processed, just forward the chunk.
//       this.push(chunk)
//     }

//     callback()
//   }

//   _flush(callback) {
//     // Push any remaining content in the buffer when the stream ends.
//     if (this.bufferedContent) {
//       this.push(this.bufferedContent)
//     }
//     callback()
//   }
// }

// export default AddBaseTagTransform
