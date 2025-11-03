
function generateUniqueId(sting_length, addition = "", customString = "") {
    const string = customString || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < sting_length; i++) {
        randomString += string.charAt(Math.floor(Math.random() * string.length))
    }
    return addition + randomString
}


export { generateUniqueId }