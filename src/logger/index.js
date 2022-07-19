const pad = i => {
  return String(i).padStart(2, 0)
}

const getTimestamp = () => {
  const dt = new Date()
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())} ${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
}

export const info = (...args) => {
  const t = getTimestamp()
  console.info(t, ...args)
}

export const warn = (...args) => {
  const t = getTimestamp()
  console.warn(t, ...args)
}

export const error = (...args) => {
  const t = getTimestamp()
  console.error(t, ...args)
}
