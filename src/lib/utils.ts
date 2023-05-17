export const getRandomUpTo = (value: number) => {
  return Math.floor(Math.random() * value)
}

export const shuffleArray = <T>(arr: T[]) => {
  let j, x, i
  
  for (i = arr.length - 1; i > 0; i--) {
    j = getRandomUpTo(i + 1)
    x = arr[i]
    arr[i] = arr[j]
    arr[j] = x
  }
}
