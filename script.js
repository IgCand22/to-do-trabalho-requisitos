document.addEventListener('DOMContentLoaded', () => {
    // Referências principais
    const botao = document.getElementById('button')
    const campo = document.getElementById('campo')
    const item  = document.getElementById('item')
    let cont = 1

    // Referências para mostrar estatísticas
    const totalEl = document.getElementById('total')
    const concluidasEl  = document.getElementById('done')
    const progressoEl  = document.getElementById('progress')
    const restantesEl  = document.getElementById('left')

    // Limite de tarefas
    const LIMITE = 10
    const CHAVE_ARMAZENAMENTO = 'todos_coloridos'


    const carregar = () => JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO) || '[]')
    const salvar = (arr) => localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(arr))

    //Monta a lista inicial
    carregar().forEach(tarefa => {
        criarTarefa(tarefa.texto, tarefa.concluida, false)
    })
    atualizarEstatisticas()

    // Pressionar Enter adiciona tarefa
    item.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            botao.click();
        }
    })

    // Clique no botão adiciona tarefa
    botao.addEventListener('click', () => {
        if(item.value.trim() === "") return;   // não deixa adicionar vazio
        if (campo.querySelectorAll('.todo').length >= LIMITE) return; // não passa do limite

        criarTarefa(item.value.trim(), false, true)
        item.value = "";   // limpa input
        item.focus();      // volta o foco pro campo
    })

    //Função que cria uma nova tarefa
    function criarTarefa(texto, concluida, salvarNoStorage){
        const aFazer = document.createElement('div')
        aFazer.id = `aFazer${cont}`
        aFazer.className = 'todo' + (cont % 3 === 2 ? ' green' : cont % 3 === 0 ? ' orange' : '')

        const textAFazer = document.createElement('p')
        textAFazer.id = `text${cont}`
        textAFazer.className = 'todo-text'
        textAFazer.textContent = texto

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.id = `button${cont}`
        checkbox.className = 'check'
        checkbox.checked = concluida

        const btExcluir = document.createElement('button')
        btExcluir.id = `btExcluir${cont}`
        btExcluir.textContent = 'X'
        btExcluir.className = 'del'

        // Botão de editar
        const btEditar = document.createElement('button')
        btEditar.id = `btEditar${cont}`
        //btEditar.textContent = '?' MEXI SÓ PRA DEIXAR O LÁPIS
        btEditar.className = 'edit'
        

        // monta a div
        aFazer.appendChild(textAFazer)
        aFazer.appendChild(checkbox)
        aFazer.appendChild(btExcluir)
        aFazer.appendChild(btEditar) 
        campo.appendChild(aFazer)

        // se já vem concluída
        if (concluida){
            aFazer.classList.add('done')
            textAFazer.style.color = '#7bbf8d'
        }

        cont++;

        // marcar como concluída
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                textAFazer.style.color = '#7bbf8d'
                aFazer.classList.add('done')
            } else {
                textAFazer.style.color = '#000000'
                aFazer.classList.remove('done')
            }
            sincronizar()
        })

        // excluir tarefa
        btExcluir.addEventListener('click', () => {
            aFazer.remove()
            sincronizar()
        })

        // lógica de editar 
        btEditar.addEventListener('click', () => {
            
            const input = document.createElement('input')
            input.type = 'text'
            input.value = textAFazer.textContent
            input.className = 'edit-input'

            // salvar edição ao perder foco
            input.addEventListener('blur', () => {
                const novoTexto = input.value.trim()
                textAFazer.textContent = novoTexto || textAFazer.textContent
                input.parentNode.replaceChild(textAFazer, input)
                sincronizar()
            })

            // salvar com Enter / cancelar com Esc
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur()
                } else if (e.key === 'Escape') {
                    input.parentNode.replaceChild(textAFazer, input)
                }
            })

            textAFazer.parentNode.replaceChild(input, textAFazer)
            input.focus()
            input.select()
        })
        // -------------------------------------------

        if (salvarNoStorage) sincronizar(); 
        else atualizarEstatisticas();
    }

    //Sincroniza lista com o localStorage
    function sincronizar(){
        const lista = Array.from(campo.querySelectorAll('.todo')).map(el => ({
            texto: el.querySelector('.todo-text').textContent,
            concluida: el.classList.contains('done')
        }))
        salvar(lista)
        atualizarEstatisticas()
    }

    //Atualiza estatística
    function atualizarEstatisticas(){
        const total = campo.querySelectorAll('.todo').length
        const concluidas  = campo.querySelectorAll('.todo.done').length
        const restantes  = Math.max(total - concluidas, 0)
        const progresso  = total ? Math.round(concluidas/total*100) : 0

        if (totalEl) totalEl.textContent = total
        if (concluidasEl)  concluidasEl.textContent  = concluidas
        if (progressoEl)  progressoEl.textContent  = progresso + '%'
        if (restantesEl)  restantesEl.textContent  = restantes

        // desabilita botão se chegou no limite
        botao.disabled = total >= LIMITE
        botao.style.filter = botao.disabled ? 'grayscale(1) brightness(.9)' : ''
    }
})
