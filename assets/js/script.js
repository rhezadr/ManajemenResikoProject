loadGuides('../../data/guide.json')

document.getElementById('generate').addEventListener('click', () => {
    const dataCount = document.getElementById('banyakDataPermintaan').value
    const demandDataHTML = document.getElementById('demandData')

    demandDataHTML.innerHTML += `
        <div class="demand-data-input">
            ${createDemandDataInput(dataCount)}
        </div>
    `

    const cost = {
        biayaProduksi: document.getElementById('biayaProduksi').value,
        biayaPenjualan: document.getElementById('biayaPenjualan').value
    }
    const resultHTML = document.querySelector('.result .content-body')

    resultHTML.innerHTML += `
        <div class="cost-data-result mb-3">
            ${createCostDataResult(cost)}
        </div>
    `
})

document.querySelector('.data-input .content-body').addEventListener('click', (event) => {
    const targetElement = event.target
    if (targetElement === document.querySelector('#submit')) {
        // store all form input value for persistency in event bubbling
        const demandDataCount = document.getElementById('banyakDataPermintaan').value
        const demandData = document.getElementsByName('permintaan[]')
        const probabilityData = document.getElementsByName('probabilitas[]')

        const data = []
        for (let i = 0; i < demandData.length; i++) {
            data.push({
                permintaan: demandData[i].value,
                probabilitas: probabilityData[i].value
            })
        }

        const cost = {
            produksi: document.getElementById('biayaProduksi').value,
            penjualan: document.getElementById('biayaPenjualan').value
        }

        // payoff and expected return calculation, and get conclusion
        const payoff = getPayoff(data, cost)
        const expectedReturn = getExpectedReturn(data, payoff)
        const conclusion = getConclusion(expectedReturn)

        // create payoff and expected return table
        const dataInputHTML = document.querySelector('.data-input .content-body')

        if (dataInputHTML.querySelector('.payoff-table') !== null) {
            const payoffTableHTML = dataInputHTML.querySelector('.payoff-table')
            payoffTableHTML = createPayoffTable(payoff, data)
        } else {
            dataInputHTML.innerHTML += `
                <div class="payoff-table">
                    ${createPayoffTable(payoff, data)}
                </div>
            `
        }

        // create expected return table
        const resultHTML = document.querySelector('.result .content-body')
        resultHTML.innerHTML += `
            <div class="expected-return-table mb-3">
                ${createExpectedReturnTable(expectedReturn)}
            </div>
        `

        // create conclusion
        resultHTML.innerHTML += `
            <div class="conclusion mb-3">
                ${createConclusion(conclusion)}
            </div>
        `

        // assign back form input value
        document.getElementById('banyakDataPermintaan').value = demandDataCount
        document.getElementById('biayaProduksi').value = cost.produksi
        document.getElementById('biayaPenjualan').value = cost.penjualan

        for (let i = 0; i < demandData.length; i++) {
            demandData[i].value = data[i].permintaan
            probabilityData[i].value = data[i].probabilitas
        }
    }
}, true)

async function loadGuides(url) {
    await fetch(url)
        .then(response => {
            return response.json()
        })
        .then(data => {
            data.forEach((item, i) => {
                const guideBody = document.querySelector('.guide .content-body')
                guideBody.innerHTML += `<p>${i + 1}. ${item.guide}</p>`
            })
        })
}

function createDemandDataInput(n) {
    let htmlStr = `
        <label class="form-label">Demand Data</label>
        <div class="row mb-3">
            <div class="col-md-2">
                No.
            </div>
            <div class="col-md-5">
                Permintaan
            </div>
            <div class="col-md-5">
                Probabilitas
            </div>
        </div>
        <ul class="demand-data-list" id="demandDataList">
    `

    for (let i = 0; i < n; i++) {
        htmlStr += `
            <li class="demand-data-list-item" id="demandDataListItem">
                <div class="row mb-3">
                    <div class="col-md-2 m-auto">
                        [ ${i + 1} ]
                    </div>
                    <div class="col-md-5">
                        <input type="text" class="form-control" id="permintaan" name="permintaan[]" placeholder="10">
                    </div>
                    <div class="col-md-5">
                        <input type="text" class="form-control" id="probabilitas" name="probabilitas[]" placeholder="0.1">
                    </div>
                </div>
            </li>
        `
    }

    htmlStr += `
        </ul>
        <div class="mb-3">
            <button class="btn btn-sm btn-primary" id="submit">Submit</button>
        </div>
    `

    return htmlStr
}

function createCostDataResult(cost) {
    let htmlStr = `
        <p>Biaya Produksi: ${cost.biayaProduksi}</p>
        <p>Biaya Penjualan: ${cost.biayaPenjualan}</p>
    `

    return htmlStr
}

function getPayoff(data, cost) {
    const payoff = []

    for (let i = 0; i < data.length; i++) {
        const row = []
        for (let j = 0; j < data.length; j++) {
            if (j < i) {
                row.push(data[j].permintaan * cost.penjualan - data[i].permintaan * cost.produksi)
            } else {
                row.push(data[i].permintaan * cost.penjualan - data[i].permintaan * cost.produksi)
            }
        }
        payoff.push(row)
    }

    return payoff
}

function createPayoffTable(payoff, data) {
    let htmlStr = `
        <label class="form-label">Payoff Table</label>
        <table class="table table-bordered">
            <tbody>
                <tr class="table-light">
                    <th scope="col">Permintaan</th>
    `
    data.forEach(item => htmlStr += `
                    <th scope="col">${item.permintaan} (${item.probabilitas})</th>
    `)

    htmlStr += `
                </tr>
    `

    for (let i = 0; i < payoff.length; i++) {
        htmlStr += i % 2 == 1
            ? `
                <tr class="table-light">
            `
            : `
                <tr class="table-light">
            `
        htmlStr += `
                    <th scope"col">${data[i].permintaan}</th>
        `

        for (let j = 0; j < payoff.length; j++) {
            htmlStr += `
                    <td>${payoff[i][j]}</td>
            `
        }

        htmlStr += `
                </tr>
        `
    }

    htmlStr += `
            </tbody>
        </table>
    `

    return htmlStr;
}

function getExpectedReturn(data, payoff) {
    const expectedReturn = []
    for (let i = 0; i < payoff.length; i++) {
        let sum = 0
        for (let j = 0; j < payoff[i].length; j++) {
            sum += payoff[i][j] * data[j].probabilitas
        }

        expectedReturn.push({
            permintaan: data[i].permintaan,
            value: sum
        })
    }

    return expectedReturn
}

function createExpectedReturnTable(expectedReturn) {
    let htmlStr = `
        <label class="form-label">Payoff Table</label>
        <table class="table table-bordered">
            <tbody>
                <tr class="table-light">
                    <th scope="col">Permintaan</th>
                    <th scope="col">Expected Return</th>
                </tr>
    `

    for (let i = 0; i < expectedReturn.length; i++) {
        htmlStr += i % 2 == 1
            ? `
                <tr class="table-light">
            `
            : `
                <tr class="table-light">
            `
        htmlStr += `
                    <th scope"col">${expectedReturn[i].permintaan}</th>
                    <td>${expectedReturn[i].value}</td>
            `

        htmlStr += `
                </tr>
        `
    }

    htmlStr += `
            </tbody>
        </table>
    `

    return htmlStr;
}

function getConclusion(expectedReturn) {
    let maxIndex = -1
    for (let i = 0; i < expectedReturn.length; i++) {
        console.log(maxIndex)
        if (i === 0) {
            maxIndex = i
        } else {
            if (expectedReturn[i].value > expectedReturn[maxIndex].value) {
                console.log('OK')
                maxIndex = i
            }
        }
    }

    return expectedReturn[maxIndex]
}

function createConclusion(conclusion) {
    let htmlStr = `
        <p>Kesimpulan: ambil permintaan sejumlah <b>${conclusion.permintaan}</b> karena memiliki nilai expected return tertinggi yaitu <b>${conclusion.value}</b></p>
    `

    return htmlStr
}
