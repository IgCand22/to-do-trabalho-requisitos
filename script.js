document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('button')
    const campo = document.getElementById('campo')

    button.addEventListener('click', () => {
        const item1 = document.getElementById('item1')
        const aFazer = document.createElement('div')
        aFazer.id = 'aFazer'
        const textAFazer = document.createElement('p')
        const newButton = document.createElement('button')
        newButton.textContent = '/'
        textAFazer.textContent = item1.value;
        aFazer.appendChild(textAFazer)
        aFazer.appendChild(newButton)
        campo.appendChild(aFazer)

        newButton.addEventListener('click', () => {

        })
    })

})