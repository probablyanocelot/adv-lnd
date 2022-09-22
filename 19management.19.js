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


let dupeDict = new Object;


function populateDupeDict() {
	for (let container in bankDict) {
		// console.log(bankDict[container])
		for (let slot in bankDict[container]) {

			let item = bankDict[container][slot]
			if (!item) continue;
			
			console.log(item)

			let itemName = item.name
			dupeDict[itemName] = dupeDict[itemName] || []

			let itemQty = item.q
			if (itemQty) dupeDict[itemName].push({ q: itemQty, slot: slot, container: container, })

			let itemLevel = item.level
			if (itemLevel >= 0 && item.p) dupeDict[itemName].push({ level: itemLevel, slot: slot, container: container, p: item.p, })
			if (itemLevel >= 0 && !item.p) dupeDict[itemName].push({ level: itemLevel, slot: slot, container: container, })
			// dupeDict[bankDict[]]
		}
	}
	// console.log(dupeDict)
}


function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}


function hasProp(container, propStr) {
	for (let idx in container) {
		let item = container[idx]
		if (!item) continue;
		let itemName = item.name
		let itemInfo = G.items[itemName]

		if (itemInfo.hasOwnProperty(propStr)) log(`${itemName} has ${propStr}`)
		// const hasProperty = (propStr) => { if (itemInfo.hasOwnProperty(propStr)) log(`${itemName} has ${propStr}`) }
		// hasProperty('e')
	}
}


function exampleFindDuplicate() {
	let array = [{ "name": "Steven Smith", "Country": "England", "Age": 35 }, { "name": "Hannah Reed", "Country": "Scottland", "Age": 23 }, { "name": "Steven Smith", "Country": "England", "Age": 35 }, { "name": "Robert Landley", "Country": "England", "Age": 84 }, { "name": "Steven Smith", "Country": "England", "Age": 35 }, { "name": "Robert Landley", "Country": "England", "Age": 84 }]

	let result = Object.values(array.reduce((c, v) => {
		let k = v.name + '-' + v.Age;
		c[k] = c[k] || [];
		log(c)
		c[k].push(v);
		return c;
	}, {})).reduce((c, v) => v.length > 1 ? c.concat(v) : c, []);

	console.log(result);
}
