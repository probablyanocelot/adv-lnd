// ! TODO: MOVE this.upgrade_all() to an outside loop
log("3 - Merchant") // display load_code() page number for debugging purposes
load_code('1Main') // main
load_code('23Dicts')
load_code('11Npcs') // NPCS - buyFromPonty()/Goblin
load_code('12Inv')
load_code('14Partying')
load_code('16Relations')
load_code('19Management')
load_code('40Gui')

//load_code(53) // upgrade_all2 WILL ADD MORE
//performance_trick()

const { webFrame } = require('electron');
webFrame.setZoomFactor(1);


map_key('F12', {
    'name': 'pure_eval',
    'code': 'electron_dev_tools()',
    'keycode': 123,
});


class Merchant extends Character {
	constructor() {
		super()
		// !!! NEED LOGIC TO USE PICK/ROD, IF EXISTS
		this.rod;
		this.pick;
		this.stand;
		this.counter = 0;
		this.home = { map: "main", x: -202.0783375408171, y: -50.0000001 }

		// loops on init
		setInterval(this.regen, 500);
		setInterval(this.buff("mluck"), 1000);
	}

	// probably redundant? should be in main.js
	regen() {
		// not full mp or hp, fix
		if (character.max_mp !== character.mp) {
			if (!is_on_cooldown("regen_mp")) {
				let missingMp = character.max_mp - character.mp
				
				// either use regen or potion
				if (missingMp <= 300) use_skill("regen_mp");
				let mPot = locate_item('mpot1')
				if (missingMp > 300 && mPot) use(mPot)
			}
		}

		// regen, need potion?
		if (character.max_hp !== character.hp) {
			if (!is_on_cooldown("regen_hp"))
				use_skill("regen_hp");
		}
		setTimeout(this.regen, 500);
	}

	loop() {
		this.counter += 1 // increment counter

		// in-game status report
		if (this.current_action && this.counter % 5 == 0) log(`Processing loop with action: ${this.current_action}`)

		this.stander() // close stand if moving

		// if we ripped, respawn and reset
		if (character.rip) {
			respawn();
			log("Rip! Respawn clear")
			this.clear_current_action();
			this.thinking = false; // most blocking state
		} else {

			loot();

			this.upgrade_all() // TODO: move out of character class!

			if (!this.current_action) {
				this.incrementCounter();
				this.manage_slots()

				//below, add if(this.rod/pick) fish/mine
				if (locate_item('rod') >= 0 || (character.slots.mainhand && character.slots.mainhand.name == 'rod')) this.do_action("fishing");
				if (locate_item('pickaxe' || (character.slots.mainhand && character.slots.mainhand.name == 'pickaxe')) >= 0) this.do_action("mining");
				this.bank_mining();
				this.go_exchange();
				if (character.moving) {
					this.idle_counter = 0;
				}
			}

			if (character.bank && this.idle_counter > 30 && !smart.moving) smart_move(this.home)

			// if (this.idle_counter / 90 == 0 ) buyFromPonty()

			if (this.idle_counter > 60 * 3) {
				this.do_runs()
			}
		}

		setTimeout(() => {
			this.loop()
		}, 1000);
	}

	incrementCounter() {
		// increment counter when we're doing nothing
		if (!this.current_action && !character.moving && !this.thinking) {
			this.idle_counter += 1
			log(`Idle: ${this.idle_counter}`);
		}
	}

	getItemAndSlot(itemName) {
		let invSlot = locate_item(itemName)
		if (!invSlot) return false
		let item = character.items[invSlot]
		if (!item) return false

		return { item: item, slot: invSlot }
		// {
		// 		item: {name: 'broom', level: 2},
		//	 	slot: 2
		// }
	}

	equipItem(itemName, eqSlot) {
		let itemAndSlot = this.getItemAndSlot(itemName)
		if (!itemAndSlot) return

		// access object's item & slot
		let { item: item, slot: invSlot } = itemAndSlot

		// declarations
		let invName = item.name
		let invlevel = item.level
		let eqItem = character.slots[eqSlot]

		// nothing equipped, equip item
		if (!eqItem) {
			equip(invSlot)
			return
		}

		// access equipped's name & level
		let { 'name': eqName, 'level': eqLevel } = eqItem


		// don't EQ if ours is better
		if (eqName == invName && eqLevel > invlevel) return
		// do EQ if wearing different item
		equip(invSlot)
	}

	manage_slots() {
		let broom = 'broom'
		// broom when no action, or not mining/fishing
		if (!this.current_action || (this.current_action != 'fishing' && this.current_action != 'mining')) this.equipItem(broom, 'mainhand')
	}

	stander() {
		if (character.moving) {
			this.stand = false;
		} else {
			this.stand = true;
		}
		if (this.stand) {
			parent.open_merchant(6)
		} else {
			parent.close_merchant(6)
		}
		setTimeout(() => {
			this.stander
		}, 1000);
	}


	do_runs() {
		if (this.current_action) return;
		this.set_current_action("doing runs")
		smart_move(this.home)
			.then(() => {
				buyFromPonty()
				smart_move("woffice")
					.then(() => {
						buyFromGoblin()
						this.clear_current_action();
						this.bank()
						//this.clear_current_action()
					})
					.catch(() => {
						log("FAILURE Gobbo");
						this.idle_counter = 0;
						this.clear_current_action()
					}
					);
			})
			.catch(() => {
				log("FAILURE: Ponty")
				this.idle_counter = 0;
				this.clear_current_action()
			}
			);
	}


	async get_pots(pots) {

		if (this.current_action == 'get_pots') return
		let lastAction = this.current_action


		// if (smart.moving) return
		let HP_TYPE = pots.h.type
		let HP_DESIRED = pots.h.qty
		let MP_TYPE = pots.m.type
		let MP_DESIRED = pots.m.qty


		let HP_TO_BUY = HP_DESIRED - quantity(HP_TYPE)
		let MP_TO_BUY = MP_DESIRED - quantity(MP_TYPE)


		// don't have enough potions -> go get some
		if (HP_TO_BUY > 0 || MP_TO_BUY > 0) {
			if (this.current_action != 'get_pots') this.set_current_action('get_pots')
			await smart_move('potions')
			log('at potions')
			// get potions since we're out of one of them
			if (HP_TO_BUY > 0) buy(HP_TYPE, HP_TO_BUY);
			if (MP_TO_BUY > 0) buy(MP_TYPE, MP_TO_BUY);
			if (lastAction == 'unpacking') { this.set_current_action('unpacking') }
			else { this.clear_current_action(); }
			return;
		}
	}


	async dumpNonUppables() {
		if (!character.bank) await doBank()
		for (let idx in character.items) {

			let item = character.items[idx];
			if (!item) continue;

			let itemName = item.name

			if (!isUpgradable(itemName) && !isCompoundable(itemName) && !sell_dict['keep'].includes(itemName)) bank_store(idx);

		}
		return
	}

	async crumbDump() {
		// quick, dirty solution to full character.
		// TODO: find another place to implement this, possibly even modify dumpNonUppables()
		if (!character.bank) await doBank()
		for (let idx in character.items) {

			let item = character.items[idx];
			if (!item) continue;

			let itemName = item.name

			// if not in keep dict, or is shiny, or is upgradable and level > 6 then store
			if (!sell_dict['keep'].includes(itemName) || item.p || (isUpgradable(itemName) && item.level > 6)) bank_store(idx);
		}
		return
	}

	async doBank() {
		if (!character.bank && this.current_action == "banking" && !smart.moving) {
			await smart_move("bank")
		}
		if (character.bank) {
			if (character.esize <= 5) await this.crumbDump()
			await this.dumpNonUppables()
			await smart_move(this.home)
		}
		this.clear_current_action();

		//			for (let item in character.bank.items2) {
		//				if (!character.bank.items2[item]) continue;
		//				bank_retrieve("items2", item);
		//		}
	}

	async bank() {
		if (this.current_action != 'banking') this.set_current_action("banking");
		if (!smart.moving) await this.doBank()
		this.clear_current_action()
		if (character.bank && !smart.moving) await smart_move(this.home)
		return
	}


	handleFailTravel(location) {
		log(`'${this.current_action}' fail clear`)
		// this.thinking = true;
		if (smart.moving) return
		smart_move(location).then(() => {
			// this.thinking = false
			this.clear_current_action()
		})
			.catch(() => {
				// this.thinking = false
				this.clear_current_action()
				xmove(location);
			}
			)
	}

	bank_mining() {
		if (locate_item("gemfragment") > 0) {
			this.set_current_action("banking");

			if (smart.moving) return

			smart_move("bank")
				.then(() => {
					if (character.bank) this.thinking = false
					log("Bank success clear")
					bank_store(locate_item("gemfragment"), "items1");
					this.bank();
				})
				.catch(() => {
					log("Bank fail clear")
					this.clear_current_action()
				})
		}
	}


	go_exchange() {
		// dont do if there's something else going on
		if (this.current_action || this.thinking)
			return;

		let exchangeItems = ["basketofeggs", "goldenegg", "gem0", "weaponbox", "candy1", "candy0", "candycane",];

		let hasExchangeable = false;
		for (let idx in exchangeItems) {
			if (locate_item(exchangeItems[idx]) > -1) {
				hasExchangeable = true;
			}
		}

		if (!hasExchangeable) return

		log("Going to exchange")
		this.thinking = true;

		let exchangeCoordinates = { map: 'main', x: -204, y: -344 }
		smart_move(exchangeCoordinates)
			.then(() => {
				this.set_current_action("exchange");
				this.thinking = false;

				let exchangeInterval = setInterval(() => {

					let sellItems = []
					for (let idx in sellItems) {
						let item = locate_item(sellItems[idx])
						if (item > -1) {
							// doesn't have a modifier
							if (character.items[item].p) {
								log("item has modifier")
							} else if (character.items[item].level) {
								log("item has level")
							} else {
								sell(item)
							}
						}
					}

					if (character.esize == 0) {
						log("No Space");
						this.upgrade_all();
						this.clear_current_action();
						clearInterval(exchangeInterval);
					}

					let hasExchangeable = false;
					for (let idx in exchangeItems) {
						let item = locate_item(exchangeItems[idx]);
						if (item > -1) {
							hasExchangeable = true;
							if (!parent.character.q.exchange) {
								exchange(item)
							}
						}
					}


					if (!hasExchangeable) {
						log("Exchangeable clear")
						this.clear_current_action();
						clearInterval(exchangeInterval);
					}
				}, 1000)
			})
			.catch(() => {
				log("failed to go to exchange");
				this.thinking = false;
			}
			)
	}

	goHomeIfIdle() {
		if (!this.thinking && !this.current_action) {
						
			if (character.real_x != this.home.x && character.real_y != this.home.y) {
				this.thinking = true;
				smart_move(this.home)
					.then(this.thinking = false)
					.catch(() => {
						smart_move(this.home)
						this.thinking = false
					})
			}
		}
	}
}


function buy_compound_scroll(scrollSlot, COMPOUND_SCROLL) {
	if (!character.items[scrollSlot]) {
		buy_with_gold(COMPOUND_SCROLL);
	}
}


function do_combine(item_name) {
	let COMPOUND_SCROLL = "cscroll0"

	let scrollSlot = locate_item(COMPOUND_SCROLL);
	// buy scroll if not in inventory


	let levelArray = [0, 1, 2, 3,]
	for (let level in levelArray) {
		// check if need different scroll
		// limited level 3 support
		if (level == 3 && item_name != 'ringsj') continue
		if (level == 3) {
			COMPOUND_SCROLL = "cscroll1"
		}
		scrollSlot = locate_item(COMPOUND_SCROLL);
		buy_compound_scroll(scrollSlot, COMPOUND_SCROLL)

		// get a list of items
		let itemList = locate_items(item_name, level);
		if (itemList.length >= 3) {
			if (item_name == "vitring" && level == 2) {
				continue
			}

			// do the compound
			if (!parent.character.q.compound) {
				if (character.ctype == "merchant" && character.mp > 400 && !character.s.massproductionpp) use_skill("massproductionpp")
				compound(itemList[0], itemList[1], itemList[2], scrollSlot)
			}
		}
	}
}



function canUpgrade() {
	if (parent.character.q.upgrade) return // currently upgrading							
	return true
}

function doUpgrade(scrollType, itemIndex) {
	scrollSlot = locate_item(scrollType)
	if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)

	if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
	if (canUpgrade) upgrade(itemIndex, scrollSlot)
}

function upgrade_all() {

	let TIMEOUT = 1000

	let itemList = upgradeDict.upgrade_all // array

	let scrollType = "scroll0"
	let scrollSlot = locate_item(scrollType)


	for (let idx in itemList) {
		let itemName = itemList[idx]
		for (let level = 0; level < 8; level++) {

			// get idx of each matching item
			// [...3, 19, 23]
			let itemSlots = locate_items(itemName, level)

			for (let listIndex in itemSlots) {

				merchantBot.goHomeIfIdle()


				let itemIndex = itemSlots[listIndex];
				
				let item = character.items[itemIndex];
				if (!item) continue
				let itemName = item.name;
				
				// buy scroll if not in character.items
				if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)

				// get item grade
				let grade = item_grade(item);

				if (item.p || item.acc) {
					log(`${itemName} has some modifier`)
					continue
				} 

				// shiny / achievement / rare / level 8   :   skip
				if (grade == 2 || item.level >= 8) continue

				// grade 1 or ( 0 & level 3-6 )
				if (grade == 1 && item.level < 7 || (grade == 0 && item.level >= 3 && item.level < 7)) {

					log(`${itemName} grade: ${grade} level: ${item.level} -> ${item.level + 1}`)

					scrollType = 'scroll1'
					doUpgrade(scrollType, itemIndex)

					continue;

				}
				if (item.level == 7 && itemName != 'ololipop') {

					log(`${itemName} 7 -> 8`)

					scrollType = 'scroll2'
					doUpgrade(scrollType, itemIndex)

					continue;

				}

				// ! CAN PROBABLY DELETE BELOW HERED

				if (item && item.p && !itemName === "stinger") {

					log("has some modifier");
					continue;
				}
				
				// upgrade if we got here
					
				if (itemName == "stinger" && item.level == 4 && !item.p) sell(itemIndex);
				if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
				
				if (canUpgrade) upgrade(itemIndex, scrollSlot)
						
			}
		}
	}
	setTimeout(upgrade_all, TIMEOUT);
}


// TODO: replace whitelists with if(upgradable && !blackList)?
function high_upgrade_all() {
	let TIMEOUT = 1000;
	let itemList = upgradeDict.high_upgrade_all
	
	let scrollType = "scroll1"
	let scrollSlot = locate_item(scrollType)
    let maxLevel = 8;

    for (let level = 0; level < maxLevel; level++) {
        for (let idx in itemList) {
            let itemName = itemList[idx]
            let itemSlots = locate_items(itemName, level)

            for (let listIndex in itemSlots) {
                let itemIndex = itemSlots[listIndex];

                // get item grade
                let grade = item_grade(character.items[itemIndex]);

				// buy scroll if not in slot 3
                if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)

				if (character.items[itemIndex].level == 7){
					scrollType = "scroll2";
					scrollSlot = locate_item(scrollType)
					if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)
					if (!parent.character.q.upgrade) {
						if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
                        upgrade(itemIndex, scrollSlot)
                        break;
					}
				}

                // grade 1+ = +7
                if (grade > 1 || grade == 0) { //|| itemName == "shoes1" && level >= 5
                    log("grade is over/under 1")
                    continue;
                } else if (character.items[itemIndex] && character.items[itemIndex].p) {
                 	log("has some modifier");
					continue;
                } else {
                    // upgrade if we got here
					if (!parent.character.q.upgrade) {
						if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
                        upgrade(itemIndex, scrollSlot)
                        break;
                    }
                }
            }
        }
    }

	setTimeout(high_upgrade_all, TIMEOUT);
}


let slots = character.slots
let activeTraderSlots = []
function getActiveTradeSlots(){
	for(let slot in character.slots){
		let regex = /trade/
		let match = regex.test(slot)
		if (!match) continue

		let mySlot = character.slots[slot]
		if (!mySlot) continue
		activeTraderSlots.push(slot)
		}
}



function compound_loop() {

	setInterval(() => {

		for (let itemName of upgradeDict.compound) {
			if (character.bank) continue;
			do_combine(itemName)
		}
	}, 1000)
}



function sell_extras() {
	// index of item in inv
	for (let itemSlot in character.items) {
		// idx, 0-41
		let item = character.items[itemSlot]
		if (!item) continue;

		let itemName = item.name
        // don't sell if not in list or is shiny
        if (!sell_dict['merchSell'].includes(itemName) || item.p) continue;

		log(`selling ${itemName}`)
		if (item.q) {
			sell(itemSlot, item.q)
			continue
		}
		sell(itemSlot)
    }
	setTimeout(sell_extras, 3000) //1440 * 1000
}


function isUpgradable(itemName) {
	if (G.items[itemName].upgrade) return true
	return false
}

function isCompoundable(itemName) {
	if (G.items[itemName].compound) return true
	return false
}

function drawLine(xOne, yOne, xTwo, yTwo, direction){

	let x;
	// let y = y

	let mag = Math.sqrt((xTwo - xOne) ** 2 + (yTwo - yOne) ** 2)
	let xThree = xTwo + d * (xTwo - xOne) / mag
	let yThree = yTwo + d * (yTwo - yOne) / mag

	let pointOne = [xOne, yOne]
	let pointTwo = [xTwo, yTwo]

	log([xThree, yThree])
	return [xThree, yThree]
	

	switch(direction){
		case 'right':
			x = Math.max(xOne, xTwo) + 5 // TODO: abstract the 5
		case 'left':
			x = Math.min(xOne, xTwo) - 5 // TODO: abstract the 5
	}

	// y-yOne == (yTwo - yOne / xTwo - xOne) * (x - xOne)
	let y = ( (yTwo - yOne / xTwo - xOne) * (x - xOne) ) + yOne

	log([x, y])
	return [x,y]
}

function sellToMerch() {
	for (itemSlot in character.items) {
		if (!itemSlot) continue

		let item = character.items[itemSlot]
		if (!item) continue

		let itemName = item.name
		if (!itemName) continue


		if (sell_dict['merchSell'].includes(itemName)) {
		log(item)
		}
	}
}


merchantBot = new Merchant;
function initMerch() {
	if (character.ctype != 'merchant') return;
	merchantBot.loop();
	setInterval(hanoi, 30000)
	sell_extras();
	compound_loop();
	upgrade_all();
	high_upgrade_all();
	//upgrade_all2();
}




initMerch();