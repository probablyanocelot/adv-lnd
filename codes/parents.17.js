log("17 - botting.js loaded")
/**
function getParentOfCharacter(name) {
    for (const iframe of top.$("iframe")) {
        const mychar = iframe.contentWindow.character
        if (!mychar) continue // Character isn't loaded yet
        if (mychar.name == name) return iframe.contentWindow
    }
}

 */






function getParentsOfCharacters(excludeSelf = true) {
    const parents = []

    for (const iframe of top.$("iframe")) {
        const mychar = iframe.contentWindow.character
        if (!mychar) continue // Character isn't loaded yet
        if (excludeSelf && mychar.name == character.name) continue
        if (!mychar.controller) {
            parents.push(top)
        } else {
            parents.push(iframe.contentWindow)
        }
    }

    return parents
}


function parentTargetting() {
    for (const eParent of getParentsOfCharacters(false)) {
        const eTarget = eParent.character.target;
        log (eParent.character.id)
        const eTargetName = eTarget ? eParent.entities[eTarget].mtype : null;
        log(`${eParent.character.name} targetting ${eTargetName}`)

        if (eTargetName == "Phoenix") {
            // TODO: the following c[name] and c.name have to be changed
            //smart_move(getCharacter(c[name]));
            //game_log("Indo ate posicao de " + c.name);
        }
    }
}

function isLeader() {
    log(getParentsOfCharacters(false)[0].character.name)
    if (getParentsOfCharacters(false)[0].character.name != character.id) {
        log("I'm not the leader")
        return false
        }
    log("I'm the leader")
    return true
}


// function test() {
//     for (i in getParentsOfCharacters(false)) {
//         log(`i: ${ i }`)
//         log(`getParentsOfCharacters(false)[i]: ${ getParentsOfCharacters(false)[i] }`)
//     }
//     setTimeout(test, 2000)
// }