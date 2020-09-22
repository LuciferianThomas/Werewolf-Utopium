const getRandomInt = (min, max) => {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min)) + min
}

const oldsentences = [
	"I am the king of watermelon seed spitting",
	"Remarkably, running rapidly really requires rhythm",
	"Code usually works if you don't type any errors",
	"Once there was a way, but now it has been vanquished",
	"A duck walked up to the lemonade stand",
	"The blacksmith smithed his best smith last night",
	"First came the train, then came the shadow that followed",
	"In a world were anything is possible",
	"Being helpful helps if you're talented",
	"Claws to sword to bow creates a chain kill",
]

const sentences = [
	"Do not expose it to the rain",
	"Tom must have told Mary about what happened",
	"She is not a good person",
	"Her work is to wash the dishes",
	"Phil has really moved to Boston",
	"Please show me how to use the headset",
	"This is exactly what I needed",
	"Mark made a careful selection",
	"I do not think Ted and Sara should get married",
	"They are still looking for a new manager",
	"I am not afraid of snakes anymore",
	"Keep your promise or it'll damage your reputation",
	"Few politicians admit their mistakes",
	"I have a funny feeling",
	"That sounds normal"
]

function ord(number) {
	if (number === 0) return "0"
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
	return `||The ${ord(senchar + 1)} character of the ${ord(sennum + 1)} sentence is \`${sentences[sennum].charAt(senchar)}\`.||`
}

const eventended = () => {
	return `If you see this message, report in <#659240055860363264> what command you used to get this message`
}

module.exports = senlet
//module.exports = eventended
