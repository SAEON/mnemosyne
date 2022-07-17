const pad = i => {
  return String(i).padStart(2, 0)
}

const getTimestamp = () => {
  const dt = new Date()
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())} ${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
}

export const info = (...msg) => {
  const t = getTimestamp()
  console.info(t, ...msg)
}

export const warn = (...msg) => {
  const t = getTimestamp()
  console.warn(t, ...msg)
}
