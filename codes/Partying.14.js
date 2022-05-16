log(89)
// send_cm("CHARACTERNAME",{a:1,b:2,c:"something"});
// to send messages, objects to your character


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


function getPosition(id) {
    if(parent.entities[id]) return parent.entities[id]
    return get(`${id}_position`) ?? undefined
}

function savePosition() {
    return set(`${character.id}_position`, {
        server: {
            region: server.region,
            id: server.id
        },
        time: new Date().toISOString(),
        in: character.in,
        map: character.map,
        x: character.x,
        y: character.y
    })
}