log("3 - Merchant") // display load_code() page number for debugging purposes
load_code('1Main') // main
load_code('23Dicts')
load_code('11Npcs') // NPCS - buyFromPonty()/Goblin
load_code('12Inv')
load_code('14Partying')
load_code('16Relations')
load_code('19Management')

//load_code(53) // upgrade_all2 WILL ADD MORE
//performance_trick()

const { webFrame } = require('electron');
webFrame.setZoomFactor(0.9);


let BANK_ITEMS = {};
BANK_ITEMS['items0'] = [];
BANK_ITEMS['items1'] = ["snakefang", "frogt", "vitscroll", "gemfragment"];
BANK_ITEMS['items2'] = [];



class Merchant extends Character {
	constructor() {
		super()
		// !!! NEED LOGIC TO USE PICK/ROD, IF EXISTS
		this.rod;
		this.pick;
		this.stand;
		this.counter = 0;
		this.home = { map: "main", x: -202.0783375408171, y: -50.0000001 }

		setInterval(this.regen, 500);

		setInterval(this.buff("mluck"), 1000);
	}
	
	// probably redundant? should be in main.js
	regen() {
		if (character.max_mp !== character.mp) {
			if (!is_on_cooldown("regen_mp"))
				use_skill("regen_mp");
		}

		if (character.max_hp !== character.hp) {
			if (!is_on_cooldown("regen_hp"))
				use_skill("regen_hp");
		}
		setTimeout(this.regen, 500);
	}
	
	loop() {
		this.counter += 1
		
		// in-game status report
		if (this.current_action && this.counter % 5 == 0) log(`Processing loop with action: ${this.current_action}`)
		
		this.stander()

		// if we ripped, respawn and reset
		if (character.rip) {
			respawn();
			log("Rip! Respawn clear")
			this.clear_current_action();
			this.thinking = false;
		} else {
			
			loot();
			
			if (!this.current_action) {
				this.incrementCounter();
				//below, add if(this.rod/pick) fish/mine
				if (locate_item('rod') >= 0 || character.slots.mainhand.name == 'rod') this.do_action("fishing");
				if (locate_item('pickaxe' || character.slots.mainhand.name == 'rod') >= 0) this.do_action("mining");
				this.bank_mining();
				this.go_exchange();
				this.upgrade_all();
				sell_extras();
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
		if (!character.bank)  await doBank()
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
			if (!sell_dict['keep'].includes(itemName) || item.p || (isUpgradable(itemName) && item.level > 6 )) bank_store(idx);
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
			this.clear_current_action();
			if (!smart.moving) await smart_move(this.home)
		}
		
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
	



	upgrade_all() {
		let itemList = ['xmasshoes', 'xmaspants', 'xmassweater', "xmashat", "mushroomstaff", "stinger", "wcap", "wattire", "wbreeches", "wgloves", "wshoes", "bow", "swifty", "hbow", "sshield", "cclaw", "blade", "eslippers", "eears", "epyjamas", "quiver", 'ololipop',]

		let scrollType = "scroll0"
		let scrollSlot = locate_item(scrollType)
	
		// let action = "upgrade"
		// dont do if there's something else going on
		if (this.current_action || smart.moving) return;

		//this.current_action = action
		
		for (let idx in itemList) {
			let itemName = itemList[idx]
			for (let level = 0; level < 8; level++) {
				let itemSlots = locate_items(itemName, level)
				if (!itemSlots.length || idx.grade >= 1) {
					continue
				}
				

				for (let listIndex in itemSlots) {
					let itemIndex = itemSlots[listIndex];
					let item = character.items[itemIndex];
					let itemName = character.items[itemIndex].name;
					// buy scroll if not in slot 3
					if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)

					// get item grade
					let grade = item_grade(character.items[itemIndex]);
						
					//this.current_action = action;
					
					// grade 1+ = +7
					if (grade > 0 && grade < 2) {
						log("grade is over 0")
						// if (item.level >= 5){
						scrollType = 'scroll1'
						scrollSlot = locate_item(scrollType)
						if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)
						if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
						upgrade(itemIndex, scrollSlot)
						// }
						// this.clear_current_action();
						continue;
					
					}
					if (character.real_x != this.home.x && character.real_y != this.home.y) {
						if (!this.thinking) {
							this.thinking = true;
							smart_move(this.home)
								.then(this.thinking = false)
								.catch(() => {
									smart_move(this.home)
									this.thinking = false
								})
						}
					}
					
					if (character.items[itemIndex] && character.items[itemIndex].p && !itemName === "stinger") {
						log("has some modifier");
						// this.clear_current_action();
						continue;
					} else {
						// upgrade if we got here
						if (!parent.character.q.upgrade) {
							if (itemName == "stinger" && item.level == 4 && !item.p) {
								sell(itemIndex);
								// this.clear_current_action();
							} else {
								// this.set_current_action(action);
								if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
								upgrade(itemIndex, scrollSlot)
								// 	.then(() => {
								// 		// if (this.current_action == action) {
								// 			log("Upgrade success clear")
								// 			// this.clear_current_action();
								// 		// }
								// 	})
								// 	.catch(() => {
								// 		// if (this.current_action == action) {
								// 			log("Upgrade failure clear")
								// 			// this.clear_current_action();
								// 		// }
								// 	}
								// )
							}
						}
					}
				}
			}
		}
	}

}

function buy_compound_scroll(scrollSlot, COMPOUND_SCROLL) {
	if (!character.items[scrollSlot]) {
		buy_with_gold(COMPOUND_SCROLL);
	}
}


let compoundList = [
	'intamulet', 'intring', 'intbelt', 'intearring', 'strring',
	'strearring', 'stramulet', 'strbelt', 'dexamulet',
	'dexring', 'dexbelt', 'dexearring', 'skullamulet',
	'book0', 'hpamulet', 'hpbelt', 'ringsj', 'wbook0',
	'vitring',
]

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



function high_upgrade_all() {
	let TIMEOUT = 1000;
	let itemList = [ 
		'xmasshoes', 'xmaspants', 'xmassweater', "xmashat",'merry',
		 "epyjamas", "eears", "pants1", "gloves1", "firestaff",
		  "shoes1", "fireblade", "quiver", 'ecape',
		   'pinkie','t2bow',
		] //"bataxe", "oozingterror", "harbringer","basher",
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

		for (let itemName of compoundList) {
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
        if (!sell_dict['merchTrash'].includes(itemName) || item.p) continue;
		
		log(`selling ${itemName}`)
		sell(itemSlot)
    }
	setTimeout(sell_extras, 1440 * 1000)
}


function isUpgradable(itemName) {
	if (G.items[itemName].upgrade) return true
	return false
}

function isCompoundable(itemName) {
	if (G.items[itemName].compound) return true
	return false
}


merchantBot = new Merchant;
function initMerch() {
	if (character.ctype != 'merchant') return;
	merchantBot.loop();
	setInterval(hanoi, 30000)
	compound_loop();
	high_upgrade_all();
	//upgrade_all2();
}




initMerch();