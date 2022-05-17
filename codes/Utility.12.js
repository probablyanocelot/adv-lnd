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

