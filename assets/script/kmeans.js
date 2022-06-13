function show(pontos, centroides) {
    var data = []
    centroides.forEach((centroide, indexC) => {
        let list_x = []
        let list_y = []
        pontos.forEach((ponto)=> {
            if( ponto.menorDist[2] == indexC ) {
                list_x.push(ponto.X1)
                list_y.push(ponto.X2)
            }

        })
        data.push( {
            x: list_x,
            y: list_y, 
            mode: 'markers',
            type: 'scatter',
            name: 'Centroide '+indexC,
            marker: { size: 7 }
        })
    })

    var layout = {
    xaxis: {
        range: [-10, 110]
    },
    yaxis: {
        range: [-5, 100]
    },
    title:'Gráfico de dispersão'
    }
    // console.log(data)
    Plotly.newPlot('result', data, layout)    
}

function getMenor(distancia) {
    let menor = distancia[0].d
    let index = distancia[0].i
    distancia.forEach(elem => {
        if(elem.d < menor) {
            menor = elem.d
            index = elem.i
        }
    })
    return {dist:menor,index}
}

function getDistancia(ponto, centroide) {
    // Distancia Euclidiana
    let dist = 0;
    for (const i in centroide) {
        dist += Math.pow(centroide[i] - ponto[i], 2);
    }
    return Math.sqrt(dist);
}

function getRandom(n, sorteados){
    let rand = Math.floor(Math.random() * n);
    while(sorteados.includes(rand)){
        rand = Math.floor(Math.random() * n);
    }
    sorteados.push(rand)
    console.log(rand)
    return rand
}

function reposicionaCentroides(pontos, centroides) {
    // Para cada centroide
    centroides.forEach((centroide,indexC) => {
        let soma = []
        let cont = 0
        let length = Object.keys(centroide).length;

        for(let i=0; i<length; i++)
            soma.push(0)

        // Para cada ponto
        pontos.forEach(ponto => {
            if(ponto.menorDist[2] == indexC) { // [0] - distancia, [1] indexP, [2] indexC
                // Percorre atributos do ponto
                for(let i=0; i<length; i++) {
                    // Soma os atributos de mesma posição
                    soma[i] += ponto[Object.keys(ponto)[i]]
                }
                cont++
            }
        })

        for(i=0; i<length; i++) {
            // Substiui o valor da soma pela média
            soma[i] = parseInt(soma[i]/cont)
        }
        
        i=0 // Posiciona centroide baseado na média dos atributos dos seus pontos
        for (var x in centroide) {
            centroide[x] = soma[i]
            i++
        }
    })
}

function setCentroides(pontos, n, k) {
    var centroides = []
    let sorteados = []
    for (let i=0; i<k; i++) {
        let index = getRandom(n, sorteados) // Sorteia um numero, não repetido
        let aux = $.extend(true, {}, pontos[index]); // Copia um ponto para ser o centroide
        
        centroides.push(aux)
    }
    return centroides
}

function csvToJson() {
    var csv = $("#csv")[0].files[0];
    if (csv !== undefined) {
        var reader = new FileReader();
        reader.readAsText(csv);
        reader.onload = function (e) {
            // Inicio KMEANS
            const k = $('#k').val()
            const pontos = csvjsonConverter(e.target.result, $("#delimiter").val(), 'kmeans');
            const n = pontos.length

            var centroides = setCentroides(pontos, n, k)

            do {

                //limpa as distancias
                centroides.forEach(() => { pontos.forEach((ponto) => { ponto.distancias = [] }) });
                // Calcula a distancia de cada ponto para cada centroide
                centroides.forEach((centroide, indexC) => {
                    pontos.forEach((ponto, indexP) => {
                        if(ponto.distancias)
                            ponto.distancias.push([getDistancia(ponto, centroide),indexP,indexC])
                        else
                            ponto.distancias = [[getDistancia(ponto, centroide),indexP,indexC]]
                    });
                });

                // Busca o centroide com menor distancia de cada ponto
                pontos.forEach(ponto => {
                    let menorDist = ponto.distancias[0]
                    ponto.distancias.forEach(distancia => {
                        if(distancia[0] < menorDist[0]) // [0] = distancia
                            menorDist = distancia
                    })
                    // Substitui array de distancias por array com a menor distancia
                    ponto.menorDist = menorDist
                });

                var oldCentroides = _.cloneDeep(centroides)
                reposicionaCentroides(pontos, centroides)
                // console.log(!_.isEqual(oldCentroides, centroides))
            } while (!_.isEqual(oldCentroides, centroides));

            // TESTES =>
            // console.log('OLD CENTROID:')
            // console.log(oldCentroides)
            // console.log('CENTROIDE:')
            // console.log(centroides)
            // console.log('PONTOS:')
            // console.log(pontos)
            // < = TESTES
            
            show(pontos, centroides)
        }
    }
}