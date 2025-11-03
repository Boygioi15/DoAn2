export function Time_NumToText(num) {
  const min = Math.floor(num / 60)
  const sec = num % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}
