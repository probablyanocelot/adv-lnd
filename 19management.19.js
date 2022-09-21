function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}

function transcribe(fromDataStructure, toDataStructure) {
    for (child in fromDataStructure) {
        toDataStructure[child] = fromDataStructure[child]
    }
}

let loadout = new Object;

function updateLoadout() {
    loadout[character.id] = loadout[character.id] || {};
    // loadout is self or {} if undefined -- prevents wipe

    transcribe(character.slots, loadout[character.id])
}

let bankDict = new Object;

function updateBank(){
	if (!character.bank) return
	// must be in bank

	transcribe(character.bank, bankDict)
}


//      #########SELLING#########

function sell_extras_old() {
	log('selling extras')
	// index of item in inv
	for (let itemSlot in character.items) {
		
		let item = character.items[itemSlot]
		if (!item) continue;
		
		let itemName = item.name
        // not in list or is shiny, skip
        if (!sell_dict['low'].includes(itemName) || item.p) continue;
        
		sell(itemSlot)
    }
}


function sellAllByName(sellItem) {
	log(`selling by name ${sellItem}`)
	for (itemSlot in character.items) {
		if (!character.items[itemSlot]) continue
		if (character.items[itemSlot].name == sellItem)
			sell(sellItem)
	}
}
