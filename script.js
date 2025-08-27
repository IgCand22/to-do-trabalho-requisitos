document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('button')
    const campo = document.getElementById('campo')
    let cont = 1

    button.addEventListener('click', () => {
        const item = document.getElementById('item')
        if(item.value.trim() === "") return;
        const aFazer = document.createElement('div')
        aFazer.id = `aFazer${cont}`
        const textAFazer = document.createElement('p')
        textAFazer.id = `text${cont}`
        const newButton = document.createElement('button')
        newButton.textContent = '✓ Concluir'
        newButton.id = `button${cont}`
        textAFazer.textContent = item.value;
        aFazer.appendChild(textAFazer)
        aFazer.appendChild(newButton)
        campo.appendChild(aFazer)
        cont++;
        item.value = "";

        newButton.addEventListener('click', () => {
            textAFazer.style.color = '#d4edda'
        })
    })

})