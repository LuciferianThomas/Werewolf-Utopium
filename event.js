const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const sentences = [
  "I am the king of watermelon seed spitting",
  "Remarkably, running rapidly really requires rhythm",
  "Code usually works if you don't type any errors",
  "Once there was a way, but now it has been vanquished",
  "A duck walked up to the lemonade stand",
  "The blacksmith smithed his best smith last night",
  "First came the train, then came the shadow that followed",
  "In a world were anything is possible",
  "Being helpful helps if you're talented",
  "Claws to sword to bow creates a chain kill"
]

function ord(number) {
  if (number === 0) return '0'
  if (number % 100 >= 11 && number % 100 <= 13) return `${number}th`

  switch (number % 10) {
    case 1:
      return `${number}st`
    case 2:
      return `${number}nd`
    case 3:
      return `${number}rd`
    default:
      return `${number}th`
  }
  return `${number}`
}

const senlet = () => {
  let sennum = getRandomInt(0, sentences.length)
  let senchar = getRandomInt(0, sentences[sennum].length)
  return `||The ${ord(senchar+1)} character of the ${ord(sennum+1)} sentence is \`${sentences[sennum].charAt(senchar)}\`.||`
}

module.exports = senlet