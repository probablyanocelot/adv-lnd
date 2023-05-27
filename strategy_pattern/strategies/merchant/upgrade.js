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

function buy_compound_scroll(scrollSlot, COMPOUND_SCROLL) {
	if (!character.items[scrollSlot]) {
		buy_with_gold(COMPOUND_SCROLL);
	}
}

function isUpgradable(itemName) {
	if (G.items[itemName].upgrade) return true
	return false
}

function isCompoundable(itemName) {
	if (G.items[itemName].compound) return true
	return false
}


	
let uScrollMap = {
	0: 'scroll0',
	1: 'scroll1',
	2: 'scroll2',
}

let cScrollMap = {
	0: 'cscroll0',
	1: 'cscroll1',
	2: 'cscroll2',
}

let upgradeBlackList;
let compoundBlackList;
let cheapCompoundList;
let cheapUpgradeList;
let goldThreshold = 1000000000

/* 

*/

function compound_loop() {

	setInterval(() => {

		for (let itemName of upgradeDict.compound) {
			if (character.bank) continue;
			do_combine(itemName)
		}
	}, 1000)
}


function do_combine(item_name, compound_scroll) {
	let COMPOUND_SCROLL = compound_scroll

	let scrollSlot = locate_item(COMPOUND_SCROLL);
	// buy scroll if not in inventory

	let levelArray = [0, 1, 2, 3,]
	for (let level in levelArray) {
		
		
		let itemIdxList = locate_items(item_name, level); // get a list of item indices
		for (idx in itemIdxList) {
			if (character.items[idx].p && character.items[idx].p != 'shiny') {
				// compoundAlert = new Date()
				// send_tg_bot_message(`Found a ${itemList[item].p} ${item_name}`)
				return
			}
		}
		if (itemList.length >= 3) {

			// check if need different scroll
			if (level == 3 || item_grade(character.items[itemIdxList[0]]) == 1) {
				COMPOUND_SCROLL = "cscroll1"
			}
			scrollSlot = locate_item(COMPOUND_SCROLL);
			buy_compound_scroll(scrollSlot, COMPOUND_SCROLL)

			if (item_name == "vitring" && level == 2) {
				continue
			}

			// do the compound
			if (!parent.character.q.compound) {
				if (character.ctype == "merchant" && character.mp > 400 && !character.s.massproductionpp) use_skill("massproductionpp")
				compound(itemIdxList[0], itemIdxList[1], itemIdxList[2], scrollSlot)
			}
		}
	}
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


				let itemIndex = itemSlots[listIndex];
				
				let item = character.items[itemIndex];
				if (!item) continue
				let itemName = item.name;
				
				// buy scroll if not in character.items
				if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)

				// get item grade
				let grade = item_grade(item);

				// non-shiny .p : skip
				if (item.p && item.p !== "shiny") {
					log(`${itemName} has ${item.p}`)
					continue
				}

				let shinyKeep = [
					'ololipop', 'wingedboots', 'broom', 
				]
				// valuable shiny : skip
				if (item.p && shinyKeep.includes(item.name)) {
					log(`keeping ${item.p} ${itemName}`)
					continue;
				}
				// achievement : skip
				if (item.acc) {
					log(`${itemName} has some ${item.acc}`)
					continue
				} 

				// level 8   :   skip
				if (grade == 2 || item.level >= 8) continue

				// merchantBot.goHomeIfIdle()

				// grade 1 or ( 0 & level 3-6 )
				if (grade == 1 && item.level < 7 || (grade == 0 && item.level >= 3 && item.level < 7)) {

					log(`${itemName} grade: ${grade} level: ${item.level} -> ${item.level + 1}`)

					scrollType = 'scroll1'
					doUpgrade(scrollType, itemIndex)

					continue;

				}
				let conservativeUpList = ['ololipop','broom',]
				
				// turn on to save money
				// if (item.level >= 6) continue
				
				// do 6 -> 7 -> 8 with scroll2
				if (item.level > 5 && item.level < 8 && !conservativeUpList.includes(itemName)) {

					log(`${itemName} 7 -> 8`)

					scrollType = 'scroll2'
					doUpgrade(scrollType, itemIndex)

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
    let maxLevel = 7;

    for (let level = 0; level < maxLevel; level++) {
        for (let idx in itemList) {
            let itemName = itemList[idx]
            let itemSlots = locate_items(itemName, level)

            for (let listIndex in itemSlots) {
                let itemIndex = itemSlots[listIndex];

				//let item = character.items[itemIndex]
				//let itemLevel = item.level
				
                // get item grade
                let grade = item_grade(character.items[itemIndex]);

				// if (character.items[itemIndex].level == 7){
				// 	scrollType = "scroll2";
				// 	scrollSlot = locate_item(scrollType)
				// 	if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)
				// 	if (!parent.character.q.upgrade) {
				// 		if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
                //         upgrade(itemIndex, scrollSlot)
                //         break;
				// 	}
				// }

                // grade 1+ = +7
                if (grade == 0) { //|| itemName == "shoes1" && level >= 5
                    log("grade is under 1")
                    continue;
                } 
				if (character.items[itemIndex] && character.items[itemIndex].p) {
                 	log("has some modifier");
					continue;
                }

				let rareUpList = [
					'bataxe', 'harbringer', 'oozingterror', 
				]

				if (grade == 2 && level >= 6) continue
				if (level >= 4 && rareUpList.includes(itemName)) { 
					// save money
					// continue
					scrollType = 'scroll2'					
				}
				if (grade == 2 && level >=6) continue
			
				let scrollSlot = locate_item(scrollType)
				
				// buy scroll if not in inv
                if (!character.items[scrollSlot]) buy_with_gold(scrollType, 1)
				
				
				// upgrade if we got here
				if (!parent.character.q.upgrade) {
				
					if (character.ctype == "merchant" && !character.s.massproductionpp && character.mp > 400) use_skill("massproductionpp")
                        upgrade(itemIndex, scrollSlot)
                        break;
                }
            }
        }
    }

	setTimeout(high_upgrade_all, TIMEOUT);
}
