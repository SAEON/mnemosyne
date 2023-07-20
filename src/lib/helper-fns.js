export function bytesToHumanReadable(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = (bytes / Math.pow(1024, i)).toFixed(2)

  return `${value} ${sizes[i]}`
}
