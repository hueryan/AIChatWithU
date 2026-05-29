export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',')

  const header = arr[0]
  const data = arr[1]

  if (!header || !data) {
    throw new Error('Invalid base64 string')
  }

  const match = header.match(/:(.*?);/)

  if (!match) {
    throw new Error('Invalid mime type')
  }

  const mime = match[1]

  const bstr = atob(data)

  let n = bstr.length

  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, {
    type: mime
  })
}