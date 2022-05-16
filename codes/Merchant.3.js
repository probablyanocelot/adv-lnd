log("3 - Merchant") // display load_code() page number for debugging purposes
load_code(11) // NPCS - buyFromPonty()/Goblin
//load_code(53) // upgrade_all2 WILL ADD MORE
performance_trick()

const { webFrame } = require('electron');
webFrame.setZoomFactor(0.8);

let BANK_ITEMS = {};
BANK_ITEMS['items0'] = [];
BANK_ITEMS['items1'] = [];
BANK_ITEMS['items2'] = ["snakefang", "frogt", "vitscroll", "gemfragment"];


class Merchant extends Character {
    constructor(){
		super()
		this.stand;
		this.counter = 0;
		this.home = {map:"main",x:-202.0783375408171, y:-50.0000001}

		this.buyList = ["ink", "quiver", "hbow", "snakefang", "cryptkey", 'rednose', 'tigerhelmet', 'wattire', 'wbreeches', 'wgloves', "poison", "mistletoe", "basketofeggs", "candycane", "candy0", "candy1", "leather", "troll", "candypop", "mshield", "mearring", "dexearring", "intearring", "spookyamulet", "jacko", "tracker"]


		setInterval(this.buff("mluck"), 1000);
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
			
			
			if (!this.current_action) {
				this.do_action("fishing");
				this.do_action("mining");
				this.bank_mining();
				this.go_exchange();
				this.upgrade_all();
				if (character.moving) {
					this.idle_counter = 0;
				}
			}


			
			
			// increment counter when we're doing nothing
			if (!this.current_action && !character.moving && !this.thinking) {
				this.idle_counter += 1
				log(`Idle: ${this.idle_counter}`);
				}

			if (this.idle_counter > 90) {
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
		smart_move(loc1).then(
			success => {
				a && this.clearWrap(a)
				b && this.clearWrap(b)
				c && this.clearWrap(c)
				d && this.clearWrap(d)
				if (loc2) loc2().then(
					success => {
						this.clear_current_action();
					},
					failure => {
						this.idle_counter = 0;
						this.clear_current_action();
					}
				);
			},
			failure => {
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
		smart_move("secondhands").then(
			success => {
				buyFromPonty()
				smart_move("lostandfound").then(
					success => {
						buyFromGoblin()
						this.clear_current_action();
						this.bank()
						//this.clear_current_action()
					},
					failure => {
						log("FAILURE Gobbo");
						this.idle_counter = 0;
						this.clear_current_action()
					}
				);
			},
			failure => {
				log("FAILURE: Ponty")
				this.idle_counter = 0;
				this.clear_current_action()
			}
		);
	}

	bank() {
		this.clear_current_action();
		this.set_current_action("banking");
		if (!character.bank) {
			smart_move("bank").then(
				success => {
					log("Arrived at bank")
					for (let item in character.bank.items2) {
						bank_retrieve("items2", item);
					}
					this.clear_current_action();
					// if (!character.bank.items2.length) smart_move(this.home);
					smart_move("main").then(
						success => {
							this.idle_counter = 0;
							this.clear_current_action();
						},
						failure => {
							this.handleFailTravel("main");
							this.idle_counter = 0;
							this.clear_current_action()
						}
					)
					
				},
			
				failure => {
					log("FAILURE Bank");
					this.idle_counter = 0;
					this.clear_current_action()
					smart_move(this.home)
				}
			)
		}
	}
	
	handleFailTravel(location) {
		log(`'${this.current_action}' fail clear`)
		// this.thinking = true;
		smart_move(location).then(
			success => {
				// this.thinking = false
				this.clear_current_action()
			},
			failure => {
				// this.thinking = false
				this.clear_current_action()
				xmove(location);
			}
		)
	}

	bank_mining() {
		for (let idx in character.items) {
			let item = character.items[idx];
			if (item) {
				if (item.name === "gemfragment") {
					this.set_current_action("banking");
					smart_move("bank").then(
						success => {
							log("Bank success clear")
							bank_store(idx, "items1");
							if (character.bank.items2.length){
								for (let i=0; i<character.bank.items1.length; i++){
									bank_retrieve("items2", i);
								}
							}
							
							smart_move(this.home);
							this.clear_current_action();
						},
						failure => {
							log("Bank fail clear")
							this.clear_current_action()
						}
					)
				}
			}
		}
	}


	go_exchange() {
		// dont do if there's something else going on
		if (this.current_action || this.thinking)
			return;
		
		let exchangeItems = ["basketofeggs", "goldenegg", "gem0", "weaponbox", ];
		
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
		smart_move(exchangeCoordinates).then(
			success => {
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
			},
			failure => {
				log("failed to go to exchange");
				this.thinking = false;
			}
		)
	}



	upgrade_all() {
		let itemList = [ 'xmasshoes', 'xmaspants', 'xmassweater', "xmashat","mushroomstaff", "stinger", "wcap", "wattire", "wbreeches", "wgloves", "wshoes", "bow", "swifty", "hbow", "sshield", "cclaw", "blade", "eslippers", "eears", "epyjamas", "quiver"]

		let scrollType = "scroll0"
		let scrollSlot = locate_item(scrollType)
	
		let action = "upgrade"
		// dont do if there's something else going on
		if (this.current_action) return;

		//this.current_action = action
		
		for (var idx in itemList) {
			let itemName = itemList[idx]
			for (var level = 0; level < 7; level++) {
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
					if (grade > 0) {
						log("grade is over 0")
						this.clear_current_action();
						continue;
					
					}
					if (character.real_x != -204 && character.real_y != -129) {
						if (!this.thinking) {
							this.thinking = true;
							smart_move("upgrade").then(
								success => this.thinking = false,
								failure => this.thinking = false
							)
						}
					}
					
					if (character.items[itemIndex] && character.items[itemIndex].p && !itemName === "stinger") {
						log("has some modifier");
						this.clear_current_action();
					} else {
						// upgrade if we got here
						if (!parent.character.q.upgrade) {
							if (itemName == "stinger" && item.level == 4 && !item.p) {
								sell(itemIndex);
								this.clear_current_action();
							} else {
								this.set_current_action(action);
								upgrade(itemIndex, scrollSlot).then(
									success => {
										if (this.current_action == action) {
											log("Upgrade success clear")
											this.clear_current_action();
										}
									},
									failure => {
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
				for (let teller of Object.keys(BANK_ITEMS)) {
					let bank = BANK_ITEMS[teller]
					if (bank.includes(item.name)) {
						this.set_current_action("banking");
						smart_move("bank").then(
							success => {
								log("Bank success clear")
								this.clear_current_action();
								bank_store(idx, teller);
								//this.do_idle();
							},
							failure => {
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
		if (item_name == "vitring" && level == 2) {
			continue
		}
		var itemList = locate_items(item_name, level);
		if (itemList.length >= 3) {
			// do the compound
			if (!parent.character.q.compound) {
				if (character.ctype == "merchant") use_skill("massproductionpp")
				compound(itemList[0], itemList[1], itemList[2], scrollSlot)
			}
		}
	}
}



function high_upgrade_all() {
	var TIMEOUT = 1000;
	let itemList = [ 'xmasshoes', 'xmaspants', 'xmassweater', "xmashat",'merry', "epyjamas", "eears", "pants1", "gloves1", "firestaff", "shoes1", "stinger", "fireblade", "quiver", 'ecape',] //"bataxe", "oozingterror", "harbringer","basher",
	let scrollType = "scroll1"
	let scrollSlot = locate_item(scrollType)
    let maxLevel = 5;
	
    for (var level = 0; level < maxLevel; level++) {
        for (var idx in itemList) {
            let itemName = itemList[idx]
            var itemSlots = locate_items(itemName, level)

            for (var listIndex in itemSlots) {
                let itemIndex = itemSlots[listIndex];
                // buy scroll if not in slot 3
                if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)

                // get item grade
                let grade = item_grade(character.items[itemIndex]);

				
                // grade 1+ = +7
                if (grade > 1 || grade == 0 || itemName == "shoes1" && level >= 5) {
                    log("grade is over/under 1")
                    continue;
                } else if (character.items[itemIndex] && character.items[itemIndex].p) {
                    log("has some modifier");
                    continue;
                } else {
                    // upgrade if we got here
					if (!parent.character.q.upgrade) {
						if (character.ctype == "merchant") use_skill("massproductionpp")
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
		var itemList = ["ringsj", "hpamulet", "hpbelt", "vitring", "intring", "dexring", "strring", "dexamulet", "intamulet", "stramulet", "intearring", "strearring", "dexearring", "vitearring", "wbook0", "intbelt", "strbelt", "dexbelt", "orbg", 'skullamulet',];
		for (var itemName of itemList) {
			if (character.bank) continue;
			do_combine(itemName)
		}
	}, 1000)
}


char = new Merchant;
char.show();
char.loop();
setInterval(hanoi, 30000)
compound_loop();
high_upgrade_all();
//upgrade_all2();