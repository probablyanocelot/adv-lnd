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


let bankItemDict = new Object;


function populateBankItemDict() {
	for (let container in bankDict) {
		// console.log(bankDict[container])
		for (let slot in bankDict[container]) {

			// { name: 'item', level: 0 }
			let item = bankDict[container][slot]
			if (!item) continue;
			
			// console.log(item)
			
			// 'item'
            let itemName = item.name
            let itemQty = item.q
			let itemLevel = item.level
            
            
            if (itemQty) {
                BankItemDict[itemName] = BankItemDict[itemName] || []
                BankItemDict[itemName].push({ q: itemQty, slot: slot, container: container, })
            }
			if (itemLevel) {
				
                BankItemDict[itemName] = BankItemDict[itemName] || {}
                BankItemDict[itemName][itemLevel] = BankItemDict[itemName][itemLevel] || []
                // if (item.p) BankItemDict[itemName][itemLevel] += { slot: slot, container: container, p: item.p, }
                // if (!item.p) BankItemDict[itemName][itemLevel] += { slot: slot, container: container, }
                if (item.p) BankItemDict[itemName][itemLevel].push({ slot: slot, container: container, p: item.p, })
				if (!item.p) BankItemDict[itemName][itemLevel].push({ slot: slot, container: container, })
				
				// {
				// 	"intamulet": {
				// 		"1": [
				// 			{
				// 				"slot": "19",
				// 				"container": "items0"
				// 			},
				// 			{
				// 				"slot": "30",
				// 				"container": "items7"
				// 			}
				// 		],
				// 		"3": [
				// 			{
				// 				"slot": "0",
				// 				"container": "items0"
				// 			},
				// 			{
				// 				"slot": "1",
				// 				"container": "items0"
				// 			}
				// 		]
				// 	},
            }

			// FOR dict[itemName] = [] instead of {}
			// if (itemLevel >= 0 && item.p) BankItemDict[itemName].push({ level: itemLevel, slot: slot, container: container, p: item.p, })
			// if (itemLevel >= 0 && !item.p) BankItemDict[itemName].push({ level: itemLevel, slot: slot, container: container, })
			// BankItemDict[bankDict[]]
		}
	}
	// console.log(BankItemDict)
}

function updateDictMaster() {
	
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
