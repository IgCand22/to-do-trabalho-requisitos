document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('button')
    const campo = document.getElementById('campo')

    button.addEventListener('click', () => {
        const item1 = document.getElementById('item1')
        const aFazer = document.createElement('p')
        const newButton = document.createElement('button')
        newButton.textContent = '/'
        aFazer.textContent = item1.value;
        campo.appendChild(aFazer)
        campo.appendChild(newButton)
    })
    
})