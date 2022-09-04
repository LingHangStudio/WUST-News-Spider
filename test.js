async function hello() {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			console.log('Hello Promise.')
			console.log('Hello Promise.')
			console.log('Hello Promise.')
			console.log('Hello Promise.')
			console.log('Hello Promise.')
		}, 1000)
	})
}

hello()

console.log(1)