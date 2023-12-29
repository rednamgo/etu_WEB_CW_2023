//util funcs for DOM elements
export function show(elem) {
    elem.style.display = "block";
};

export function appear(elem) {
    elem.style.opacity = "1";
};

export function disappear(elem) {
    elem.style.opacity = "0";
};

export function hide (elem) {
    elem.style.display = "none";
};

export function saveRecord(name, points) {
    let records = getRecords();
    records.push([name, points]);
    localStorage.setItem("game.records", JSON.stringify(records));
}

export function getRecords() {
    return JSON.parse(localStorage.getItem("game.records") ?? "[]");
}

export function renderRecords(records) {
    let table = records.querySelector("table");
    for (let i = 0; i < table.tBodies.length; i++) {
        table.tBodies.item(i).remove();
    }
    let body = table.createTBody();
    for (let [name, points] of getRecords().sort((a, b) => a[1] - b[1])) {
        let row = document.createElement("tr"),
        nameCol = document.createElement("td"),
        pointsCol = document.createElement("td");
        nameCol.appendChild(document.createTextNode(name));
        pointsCol.appendChild(document.createTextNode(points));
        row.appendChild(nameCol);
        row.appendChild(pointsCol);
        body.appendChild(row);
    }
}

//