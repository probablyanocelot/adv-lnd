log('partying')

function getGroup(group) {
	return bots[group]
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

function killBots(currentGroup){
	for (let i = 1; i < currentGroup.length; i++) {
		stop_character(currentGroup[i]);
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

function is_friendly(char_name) {
    //check if it's one of the accounts characters
    for (char of get_characters()) {
        if (char.name === char_name) {
            return true;
        }
    }
    //see if the player is in our friendly list
    if (friendly_other_players.includes(char_name)) {
        return true;
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

function handle_party() {
	// if we are not in party && we are group leader
	if (character.name == currentGroup[0]) {
		// send out invites
		if (Object.keys(parent.party).length < currentGroup.length) {
			for (let player of currentGroup) {
				// send invite to non-main characters
				if (player != currentGroup[0]) send_party_invite(player)
			}
		}
	}
	if (character.party && character.party != currentGroup[0]) {
		// we are in the wrong party and need to leave current party
		leave_party();
	}
}
