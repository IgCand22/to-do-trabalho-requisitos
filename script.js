document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('button')
    const campo = document.getElementById('campo')
    let cont = 1

    item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                button.click();
            }
        })

    button.addEventListener('click', () => {
        const item = document.getElementById('item')
        if(item.value.trim() === "") return;
        if (cont > 10) return;

        const aFazer = document.createElement('div')
        aFazer.id = `aFazer${cont}`

        const textAFazer = document.createElement('p')
        textAFazer.id = `text${cont}`
        textAFazer.textContent = item.value;

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.id = `button${cont}`

        const btExcluir = document.createElement('button')
        btExcluir.id = `btExcluir${cont}`
        btExcluir.textContent = 'X'

        const btEditar = document.createElement('button')
        btEditar.id = `btEditar${cont}`
        btEditar.textContent = '?'

        
        aFazer.appendChild(textAFazer)
        aFazer.appendChild(checkbox)
        aFazer.appendChild(btExcluir)
        aFazer.appendChild(btEditar)
        campo.appendChild(aFazer)

        cont++;
        item.value = "";

        btEditar.addEventListener('click', () => {
            const input = document.createElement('input')
            input.type = 'text'
            input.value = textAFazer.textContent

            input.addEventListener('blur', () => {
                textAFazer.textContent = input.value
                input.parentNode.replaceChild(textAFazer, input)
            })

            textAFazer.parentNode.replaceChild(input, textAFazer)
            input.focus()
        })

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                textAFazer.style.color = '#d4edda'
                return;
            }
            textAFazer.style.color = '#000000'
        })

        btExcluir.addEventListener('click', () => {
            aFazer.remove();
        })
    })

})