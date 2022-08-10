log("12 - Utility.12.js")

function locate_items(item_name, item_level) {
    // start w/ empty array
    let itemArray = []
    
    // iterate through items
    for(var i=0;i<character.items.length;i++) {
        let item = character.items[i];
        // if the item exists
        if(item) {
            // if the item matches our query
            if (item.name == item_name && item.level == item_level) {
                // push the index to our array
                itemArray.push(i);
            }
        };
    }
    
    return itemArray
}

function current_location() {
	return {
        server: {
            region: server.region,
            id: server.id
        },
        time: new Date().toISOString(),
        in: character.in,
        map: character.map,
        x: character.x,
        y: character.y
    }
}

function request_merchant() {
	send_cm(MERCHANT_NAME, current_location())
}

function send_to_merchant(start, end) {
	for (var i = start; i < end; i++)
		if (character.items[i])
			send_item(MERCHANT_NAME, i)
}

function almost_all(start, end) {
	for (var i = start; i < end; i++) {
		send_item(MERCHANT_NAME, i, character.items[i]["q"]-1)
	}
}

let full_pack = () => {
	return character.esize <= FULL_INVENTORY_THRESHOLD;
}