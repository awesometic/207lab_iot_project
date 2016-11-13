function clarifyResponsedJsonArr(json) {
    return JSON.parse(JSON.stringify(json)
        .replace(/\\/g, '')
        .replace(/\"\[/g, '\[')
        .replace(/\]\"/g, '\]'));
}