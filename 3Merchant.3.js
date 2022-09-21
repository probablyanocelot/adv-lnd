log("3 - Merchant") // display load_code() page number for debugging purposes
load_code(1) // main
load_code(11) // NPCS - buyFromPonty()/Goblin
load_code(12)
load_code(14)
//load_code(53) // upgrade_all2 WILL ADD MORE
//performance_trick()

const { webFrame } = require('electron');
webFrame.setZoomFactor(.9);


character.on("cm", function (data) {
	if (!is_friendly()) return;
	if (block_unpack) return;
	if (!isFriendly()) return;
	switch (data.message.code) {
		case "unpack":
			char.unpack(data.name, data.message.loc)	
	}
	;
});


let BANK_ITEMS = {};
BANK_ITEMS['items0'] = [];
BANK_ITEMS['items1'] = ["snakefang", "frogt", "vitscroll", "gemfragment"];
BANK_ITEMS['items2'] = [];



var block_unpack = false;
class Merchant extends Character {
    constructor(){
		super()
		// !!! NEED LOGIC TO USE PICK, IF EXISTS
		this.rod;
		this.pick;
		this.stand;
		this.counter = 0;
		this.home = {map:"main",x:-202.0783375408171, y:-50.0000001}

		this.buyList = ["ink", "quiver", "hbow", "snakefang", "cryptkey", 'rednose', 'tigerhelmet', "poison", "mistletoe", "basketofeggs", "candycane", "candy0", "candy1", "leather", "troll", "candypop", "mshield", "mearring", "dexearring", "intearring", "spookyamulet", "jacko", "tracker"] //'wattire', 'wbreeches', 'wgloves',

		setInterval(this.regen, 500);

		setInterval(this.buff("mluck"), 1000);
	}
	
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

	myBuy(){
		if (character.in == location && is_in_range(npc) && !character.items.length >= 42 && !locate_item(item)){
		buy_with_gold(item)
		}
	}

	
	Buyble(location, npc, item) {
	
		//maybe need sockets?
	}
	
	
	loop() {
		this.counter += 1
		
				
		if (this.current_action && this.counter % 5 == 0) log(`Processing loop with action: ${this.current_action}`)
		//this.sell_trash()

		
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
				//below, add if(this.rod/pick) fish/mine
				this.do_action("fishing");
				this.do_action("mining");
				this.bank_mining();
				this.go_exchange();
				this.upgrade_all();
				sell_extras();
				if (character.moving) {
					this.idle_counter = 0;
				}
			}


			
			
			// increment counter when we're doing nothing
			if (!this.current_action && !character.moving && !this.thinking) {
				this.idle_counter += 1
				log(`Idle: ${this.idle_counter}`);
				}

			if (this.idle_counter > 60*15) {
				this.do_runs()
			}
		}
		
		setTimeout(() => {
			this.loop()
		}, 1000);
	}


	sell_trash() {
		for (var itemIndex in character.items) {
			let item = character.items[itemIndex];
			let itemName = item["name"];
			if (itemName == "slimestaff" && !item.p) sell(item)


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

	clearWrap(fn) {
		fn && fn();
		this.clear_current_action();
	}

	traveller(loc1, loc2, a, b, c, d) {
		smart_move(loc1)
			.then(() => {
				a && this.clearWrap(a)
				b && this.clearWrap(b)
				c && this.clearWrap(c)
				d && this.clearWrap(d)
				if (loc2) loc2()
					.then(() => {
						this.clear_current_action();
					})
					.catch(() => {
						this.idle_counter = 0;
						this.clear_current_action();
					}
				);
			})
			.catch(() => {
				log("FAILURE traveller");
				this.idle_counter = 0;
				this.clear_current_action()
			}
		);
	}
	
	
	//traveller("bank", "main", this.bank_dropoff, )

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

	unpack(name, location) {
		//if (!message == "unpack") return;
		//let location = getPosition(character);
		//let location = ;
		log(`Unpack request from ${name} at ${location}`);
		// dont do if there's something else going on
		//if (this.current_action || this.thinking)
			//return;

		this.set_current_action("unpacking");
		smart_move(location)
			.then(() => {
				send_cm(name, "arrived")
				
				for (let idx in character.items) {
					let item = character.items[idx];
					if (item) {
						if (item.name.includes('egg') || item.name === "seashell" || item.name === "crabclaw") {
							send_item(char, idx, item.q)
						}
					}
				}
				// go back
				smart_move(idle_spot).then(() => {
						log("Unpack success clear");
						this.clear_current_action()
					}
				)
			})
			.catch(() => {
				log("Failed to unpack")
			}
		)
	}


	doBank() {
		if (!character.bank && this.current_action == "banking" && !character.moving) {
			smart_move("bank");
		}
		if (character.bank) {
			this.bank_dropoff();
			}
		
//			for (let item in character.bank.items2) {
//				if (!character.bank.items2[item]) continue;
//				bank_retrieve("items2", item);
//		}
		this.clear_current_action();
		if (!this.current_action) {
			smart_move(this.home).then(() => {
					this.idle_counter = 0;
					this.clear_current_action();
				})
				.catch(() => {
					this.handleFailTravel(this.home);
					this.idle_counter = 0;
					this.clear_current_action()
				}
			);
		}
	}

	bank() {
		this.clear_current_action();
		this.set_current_action("banking");
		if (character.bank) this.doBank()
		if (!character.bank && this.current_action == "banking" && !character.moving) {
			smart_move("bank").then(() => {
					this.doBank()			
				})
				.catch(() => {
					this.bank()
				}
			)
		}
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
					this.doBank();
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
		let itemList = [ 'xmasshoes', 'xmaspants', 'xmassweater', "xmashat","mushroomstaff", "stinger", "wcap", "wattire", "wbreeches", "wgloves", "wshoes", "bow", "swifty", "hbow", "sshield", "cclaw", "blade", "eslippers", "eears", "epyjamas", "quiver", 'ololipop', ]

		let scrollType = "scroll0"
		let scrollSlot = locate_item(scrollType)
	
		let action = "upgrade"
		// dont do if there's something else going on
		if (this.current_action) return;

		//this.current_action = action
		
		for (var idx in itemList) {
			let itemName = itemList[idx]
			for (var level = 0; level < 8; level++) {
				var itemSlots = locate_items(itemName, level)
				if (!itemSlots.length || idx.grade >= 1) {
					continue
				}
				

				for (var listIndex in itemSlots) {
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
						if (item.level == 7){
							scrollType = 'scroll1'
							scrollSlot = locate_item(scrollType)
							if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)
							if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
							upgrade(itemIndex, scrollSlot)
						}
						this.clear_current_action();
						continue;
					
					}
					if (character.real_x != this.home.x && character.real_y != this.home.y) {
						if (!this.thinking) {
							this.thinking = true;
							smart_move(this.home)
								.then(this.thinking = false)
								.catch(() => {
									smart_move('main')
									this.thinking = false
								})
						}
					}
					
					if (character.items[itemIndex] && character.items[itemIndex].p && !itemName === "stinger") {
						log("has some modifier");
						this.clear_current_action();
						continue;
					} else {
						// upgrade if we got here
						if (!parent.character.q.upgrade) {
							if (itemName == "stinger" && item.level == 4 && !item.p) {
								sell(itemIndex);
								this.clear_current_action();
							} else {
								this.set_current_action(action);
								if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
								upgrade(itemIndex, scrollSlot)
									.then(() => {
										if (this.current_action == action) {
											log("Upgrade success clear")
											this.clear_current_action();
										}
									})
									.catch(() => {
										if (this.current_action == action) {
											log("Upgrade failure clear")
											this.clear_current_action();
										}
									}
								)
							}
						}
					}
				}
			}
		}
	}


	bank_dropoff() {
		for (let idx in character.items) {
			let item = character.items[idx];
			if (item) {
				if (character.bank) {
					if (!G.items[item.name].upgrade && !G.items[item.name].compound) bank_store(idx, "items1");
				}
			} continue;
		} return;
	}



	bank_dropoff2() {
		for (let idx in character.items) {
			let item = character.items[idx];
			if (item) {
				if (!G.items[item.name].upgrade && !G.items[item.name].compound) bank_store(idx, "items1");
				for (let teller of Object.keys(BANK_ITEMS)) {
					let bank = BANK_ITEMS[teller]
					if (bank.includes(item.name)) {
						this.set_current_action("banking");
						smart_move("bank")
							.then(() => {
								log("Bank success clear")
								this.clear_current_action();
								bank_store(idx, teller);
								//this.do_idle();
							})
							.catch(() => {
								log("Bank fail clear")
								this.clear_current_action()
							}
						)
					}
				}
			}
		}
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
	var COMPOUND_SCROLL = "cscroll0"

	var scrollSlot = locate_item(COMPOUND_SCROLL);
	// buy scroll if not in inventory
	if (!character.items[scrollSlot]) {
		buy_with_gold(COMPOUND_SCROLL);
		scrollSlot = locate_item(COMPOUND_SCROLL);
	}
	
	var levelArray = [0, 1, 2]
	for (var level in levelArray) {
		// get a list of items
		var itemList = locate_items(item_name, level);
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
	var TIMEOUT = 1000;
	let itemList = [ 
		'xmasshoes', 'xmaspants', 'xmassweater', "xmashat",'merry',
		 "epyjamas", "eears", "pants1", "gloves1", "firestaff",
		  "shoes1", "fireblade", "quiver", 'ecape',
		   'pinkie','t2bow',
		] //"bataxe", "oozingterror", "harbringer","basher",
	let scrollType = "scroll1"
	let scrollSlot = locate_item(scrollType)
    let maxLevel = 8;
	
    for (var level = 0; level < maxLevel; level++) {
        for (var idx in itemList) {
            let itemName = itemList[idx]
            var itemSlots = locate_items(itemName, level)

            for (var listIndex in itemSlots) {
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


function compound_loop() {

	setInterval(() => {

		for (var itemName of compoundList) {
			if (character.bank) continue;
			do_combine(itemName)
		}
	}, 1000)
}


let sell_dict = {
	'merchTrash': [
		'coat1', 'helmet1', 
	]
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