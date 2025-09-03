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

    // ---------- TOAST DE AVISO ----------
    function avisarLimite(msg = 'Limite de 10 tarefas atingido. Conclua ou apague alguma para adicionar mais.') {
        let toast = document.getElementById('aviso-limite')
        if (!toast) {
            toast = document.createElement('div')
            toast.id = 'aviso-limite'
            toast.setAttribute('role', 'status')
            toast.style.position = 'fixed'
            toast.style.left = '50%'
            toast.style.bottom = '16px'
            toast.style.transform = 'translateX(-50%) translateY(16px)'
            toast.style.maxWidth = '520px'
            toast.style.padding = '12px 14px'
            toast.style.borderRadius = '12px'
            toast.style.background = 'rgba(0,0,0,.85)'
            toast.style.color = '#fff'
            toast.style.font = '600 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
            toast.style.boxShadow = '0 10px 30px rgba(0,0,0,.35)'
            toast.style.zIndex = '9999'
            toast.style.opacity = '0'
            toast.style.transition = 'opacity .18s ease, transform .18s ease'
            document.body.appendChild(toast)
        }
        toast.textContent = `⚠️ ${msg}`
        requestAnimationFrame(() => {
            toast.style.opacity = '1'
            toast.style.transform = 'translateX(-50%) translateY(0)'
        })
        clearTimeout(avisarLimite._t)
        avisarLimite._t = setTimeout(() => {
            toast.style.opacity = '0'
            toast.style.transform = 'translateX(-50%) translateY(16px)'
        }, 2200)

        // feedbackzinho no botão
        try {
            botao.animate(
                [{transform:'scale(1)'},{transform:'scale(.97)'},{transform:'scale(1)'}],
                {duration:180, easing:'ease'}
            )
        } catch {}
    }
    // ------------------------------------

    const carregar = () => JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO) || '[]')
    const salvar = (arr) => localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(arr))

    // Monta a lista inicial
    carregar().forEach(tarefa => {
        criarTarefa(tarefa.texto, tarefa.concluida, false)
    })
    atualizarEstatisticas()

    // Pressionar Enter adiciona tarefa (aciona o clique do botão)
    item.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            botao.click()
        }
    })

    // Clique no botão adiciona tarefa
    botao.addEventListener('click', () => {
        const texto = item.value.trim()
        if (texto === "") return

        const totalAtual = campo.querySelectorAll('.todo').length
        if (totalAtual >= LIMITE) {
            // não cria a 11ª, mas mostra aviso
            avisarLimite()
            item.focus()
            return
        }

        criarTarefa(texto, false, true)
        item.value = ""
        item.focus()
    })

    // Função que cria uma nova tarefa
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

        // Botão de editar (ícone de lápis via CSS/::before ou background)
        const btEditar = document.createElement('button')
        btEditar.id = `btEditar${cont}`
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

        if (salvarNoStorage) sincronizar()
        else atualizarEstatisticas()
    }

    // Sincroniza lista com o localStorage
    function sincronizar(){
        const lista = Array.from(campo.querySelectorAll('.todo')).map(el => ({
            texto: el.querySelector('.todo-text').textContent,
            concluida: el.classList.contains('done')
        }))
        salvar(lista)
        atualizarEstatisticas()
    }

    // Atualiza estatísticas + feedback visual no botão (sem desabilitar)
    function atualizarEstatisticas(){
        const total = campo.querySelectorAll('.todo').length
        const concluidas  = campo.querySelectorAll('.todo.done').length
        const restantes  = Math.max(total - concluidas, 0)
        const progresso  = total ? Math.round(concluidas/total*100) : 0

        if (totalEl) totalEl.textContent = total
        if (concluidasEl)  concluidasEl.textContent  = concluidas
        if (progressoEl)  progressoEl.textContent  = progresso + '%'
        if (restantesEl)  restantesEl.textContent  = restantes

        const passouLimite = total >= LIMITE
        botao.style.filter = passouLimite ? 'grayscale(1) brightness(.9)' : ''
        botao.style.cursor = passouLimite ? 'not-allowed' : ''
        botao.setAttribute('aria-disabled', String(passouLimite))
        botao.title = passouLimite ? 'Limite de 10 tarefas — conclua ou apague para adicionar mais.' : ''
    }
})
