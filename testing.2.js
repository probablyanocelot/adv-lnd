async function examplePromise() { 
	const value = await someFunction()
  
	return new Promise((resolve, reject) => { /** Logic that uses value */ })
}

async function testFunction() { 
	await smart_move('potions')
	buy('hpot1', 1)
	await smart_move('main')
	log('are we there yet?')
  
	return new Promise((resolve, reject) => { /** Logic that uses value */ })
}





testFunction()
// testFunction().then(smart_move('main'))//.catch(log('yyyyy')).then(smart_move('main'))

// async function testFunction() {
// 	const value = await smart_move('potions')
// 	// sleep(5000)
  
// 	return new Promise((resolve, reject) => {
// 		// resolve(await async(() => {
// 		buy('hpot1', 10)
// 		// resolve(smart_move('main'))
// 		resolve(
// 		await (async () => {
// 			const next = await smart_move('main')
// 			return new Promise((resolve, reject) => {
// 				resolve(log('made it to main... hopefully'))
// 			})
// 		}))
// 	})
// 	}





let pots = {
	h: {
		type: 'hpot1',
		qty: 30,
	},
	m: {
		type: 'hpot1',
		qty: 30,
	},
}

class Char {
	constructor() {
		this.current_action;
	}

	set_current_action(action) {
		log(`setting ${action}`)
		this.current_action = action
	}
	clear_current_action() {
		log(`clearing action`)
		this.current_action = ''
	}


	async getPotsPromise(pots) {
		return new Promise((resolve, reject) => {
			if (this.current_action) return
			this.set_current_action('get_pots')
		
			if (smart.moving) return
			let hpotSize = pots.h.type
			let hpotQty = pots.h.qty
			let mpotSize = pots.m.type
			let mpotQty = pots.m.qty
		
			log('setting complete')
			let complete = false
			// don't have enough potions -> go get some
			if (!character.items[locate_item(hpotSize)] || character.items[locate_item(hpotSize)].q < hpotQty || !character.items[locate_item(mpotSize)] || character.items[locate_item(mpotSize)].q < mpotQty) {
				log('inside if')
				resolve(
					smart_move('potions')
						.then(() => {
							log('at potions')
							// get potions since we're out of one of them
							if (hpotQty > 0) buy(hpotSize, hpotQty);
							if (mpotQty > 0) buy(mpotSize, mpotQty);
							buy(hpotSize, hpotQty);
							buy(mpotSize, mpotQty);
							this.clear_current_action();
							complete = true;
						}))
			}
			if (smart.moving) return
			if (!complete) reject(log(complete))
		})
	}

	
}

// let char = new Char()
// char.getPotsPromise(pots).then(smart_move('main'))


// function testPromise() {
// 	return new Promise((resolve, reject) => {
// 		let x = 1;
// 	})
// 		.then((x) => {
// 			return new Promise((resolve, reject) => {
// 				let y = x + 4
// 			})
// 		 })	return y
// }

