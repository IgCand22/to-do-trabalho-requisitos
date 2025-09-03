document.addEventListener('DOMContentLoaded', () => {
    const botao = document.getElementById('button')
    const campo = document.getElementById('campo')
    const item  = document.getElementById('item')
    let cont = 1

    const totalEl = document.getElementById('total')
    const concluidasEl  = document.getElementById('done')
    const progressoEl  = document.getElementById('progress')
    const restantesEl  = document.getElementById('left')

    const LIMITE = 10
    const CHAVE_ARMAZENAMENTO = 'todos_coloridos'

    // ---------- TOAST DE AVISO ----------
    function avisar(msg) {
        let toast = document.getElementById('aviso-toast')
        if (!toast) {
            toast = document.createElement('div')
            toast.id = 'aviso-toast'
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
        clearTimeout(avisar._t)
        avisar._t = setTimeout(() => {
            toast.style.opacity = '0'
            toast.style.transform = 'translateX(-50%) translateY(16px)'
        }, 2200)

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

    carregar().forEach(tarefa => {
        criarTarefa(tarefa.texto, tarefa.concluida, false)
    })
    atualizarEstatisticas()

    item.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') botao.click()
    })

    botao.addEventListener('click', () => {
        const texto = item.value.trim()

        if (texto === "") {
            avisar("Digite uma tarefa antes de adicionar.")
            item.focus()
            return
        }

        const totalAtual = campo.querySelectorAll('.todo').length
        if (totalAtual >= LIMITE) {
            avisar("Limite de 10 tarefas atingido. Conclua ou apague alguma para adicionar mais.")
            item.focus()
            return
        }

        criarTarefa(texto, false, true)
        item.value = ""
        item.focus()
    })

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

        const btEditar = document.createElement('button')
        btEditar.id = `btEditar${cont}`
        btEditar.className = 'edit'

        aFazer.appendChild(textAFazer)
        aFazer.appendChild(checkbox)
        aFazer.appendChild(btExcluir)
        aFazer.appendChild(btEditar)
        campo.appendChild(aFazer)

        if (concluida){
            aFazer.classList.add('done')
            textAFazer.style.color = '#7bbf8d'
        }

        cont++;

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

        btExcluir.addEventListener('click', () => {
            aFazer.remove()
            sincronizar()
        })

        btEditar.addEventListener('click', () => {
            const input = document.createElement('input')
            input.type = 'text'
            input.value = textAFazer.textContent
            input.className = 'edit-input'

            input.addEventListener('blur', () => {
                const novoTexto = input.value.trim()
                textAFazer.textContent = novoTexto || textAFazer.textContent
                input.parentNode.replaceChild(textAFazer, input)
                sincronizar()
            })

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

    function sincronizar(){
        const lista = Array.from(campo.querySelectorAll('.todo')).map(el => ({
            texto: el.querySelector('.todo-text').textContent,
            concluida: el.classList.contains('done')
        }))
        salvar(lista)
        atualizarEstatisticas()
    }

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
