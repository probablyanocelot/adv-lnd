log('partying')

function is_friendly(char_name){

    //check if it's one of the accounts characters
    for(char of get_characters()){
        if(char.name === char_name){
            return true;
        }
    }

    return false;

}

function on_party_request(name)
{
    if(is_friendly(name))
        accept_party_request(name);
}

function on_party_invite(name){
    if(is_friendly(name))
        accept_party_invite(name);
}

function getCharacter(name) {
    for (const iframe of top.$("iframe")) {
        const char = iframe.contentWindow.character
        if (!char) continue // Character isn't loaded yet
        if (char.name == name) return char
    }
}

function startBots(group) {
	//if any iframes = may need more testing
	if (top.$("iframe")["1"]|| top.$("iframe")["2"]) return
	for (let toon of group)
	{
		if (toon == character.id) continue; // || toon == "camelCase"
		start_character(toon, 35)
	}
}


function sendInvites() {
	let activeChars = Object.keys(get_active_characters())
	for (let idx in activeChars) {
		let char = activeChars[idx];
		if ( char == character.name) continue;
		send_party_invite(char)
	}
}

