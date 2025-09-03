document.addEventListener('DOMContentLoaded', () => {
    // ----------------- REFERÊNCIAS BÁSICAS -----------------
    const botao = document.getElementById('button')
    const campo = document.getElementById('campo')
    const item  = document.getElementById('item')
    let cont = 1

    // Estatísticas
    const totalEl = document.getElementById('total')
    const concluidasEl  = document.getElementById('done')
    const progressoEl  = document.getElementById('progress')
    const restantesEl  = document.getElementById('left')

    // Storage keys
    const LIMITE = 10
    const CHAVE_ARMAZENAMENTO = 'todos_coloridos'
    const CHAVE_PREFS = 'todos_prefs'

    // ----------------- PREFERÊNCIAS -----------------
    function carregarPrefs() {
        const base = { confirmarExclusao: true }
        try { return Object.assign(base, JSON.parse(localStorage.getItem(CHAVE_PREFS) || '{}')) }
        catch { return base }
    }
    function salvarPrefs(p) { localStorage.setItem(CHAVE_PREFS, JSON.stringify(p)) }
    let prefs = carregarPrefs()

    // ----------------- TOAST -----------------
    function avisar(msg) {
        let toast = document.getElementById('aviso-toast')
        if (!toast) {
            toast = document.createElement('div')
            toast.id = 'aviso-toast'
            Object.assign(toast.style, {
                position:'fixed', left:'50%', bottom:'16px',
                transform:'translateX(-50%) translateY(16px)',
                maxWidth:'520px', padding:'12px 14px', borderRadius:'12px',
                background:'rgba(0,0,0,.85)', color:'#fff',
                font:'600 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                boxShadow:'0 10px 30px rgba(0,0,0,.35)', zIndex:'9999',
                opacity:'0', transition:'opacity .18s ease, transform .18s ease'
            })
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
        }, 2000)
        try { botao.animate([{transform:'scale(1)'},{transform:'scale(.97)'},{transform:'scale(1)'}], {duration:180, easing:'ease'}) } catch {}
    }

    // ----------------- STORAGE LISTA -----------------
    const carregar = () => JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO) || '[]')
    const salvar = (arr) => localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(arr))

    // Monta lista inicial
    carregar().forEach(tarefa => criarTarefa(tarefa.texto, tarefa.concluida, false))
    atualizarEstatisticas()

    // Enter adiciona
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter') botao.click() })

    // Clique adiciona
    botao.addEventListener('click', () => {
        const texto = item.value.trim()
        if (texto === "") { avisar("Digite uma tarefa antes de adicionar."); item.focus(); return }
        const totalAtual = campo.querySelectorAll('.todo').length
        if (totalAtual >= LIMITE) { avisar("Limite de 10 tarefas atingido. Conclua ou apague alguma para adicionar mais."); item.focus(); return }
        criarTarefa(texto, false, true)
        item.value = ""
        item.focus()
    })

    // ----------------- MINI MODAL DE CONFIRMAÇÃO -----------------
    // Retorna Promise<boolean>
    function confirmarExclusaoModal(trecho) {
        return new Promise(resolve => {
            if (!prefs.confirmarExclusao) { resolve(true); return }

            let overlay = document.getElementById('modal-overlay-del')
            if (!overlay) {
                overlay = document.createElement('div')
                overlay.id = 'modal-overlay-del'
                overlay.setAttribute('role', 'dialog')
                overlay.setAttribute('aria-modal', 'true')
                overlay.setAttribute('aria-labelledby', 'modal-del-titulo')
                Object.assign(overlay.style, {
                    position:'fixed', inset:'0', background:'rgba(0,0,0,.45)',
                    display:'grid', placeItems:'center', zIndex:'10000', opacity:'0',
                    transition:'opacity .18s ease'
                })

                const caixa = document.createElement('div')
                caixa.id = 'modal-del-caixa'
                Object.assign(caixa.style, {
                    width:'min(520px, 92vw)', background:'#fff', color:'#111',
                    borderRadius:'14px', padding:'16px', boxShadow:'0 20px 60px rgba(0,0,0,.35)',
                    font:'500 14px/1.45 system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                    transform:'translateY(8px)', transition:'transform .18s ease'
                })

                const titulo = document.createElement('h2')
                titulo.id = 'modal-del-titulo'
                titulo.textContent = 'Excluir tarefa?'
                Object.assign(titulo.style, {font:'700 16px/1.2 system-ui', margin:'0 0 8px'})

                const texto = document.createElement('p')
                texto.id = 'modal-del-texto'
                Object.assign(texto.style, {margin:'0 0 12px', color:'#333'})

                const checkWrap = document.createElement('label')
                Object.assign(checkWrap.style, {display:'flex', gap:'8px', alignItems:'center', margin:'8px 0 14px', userSelect:'none', cursor:'pointer'})
                const chk = document.createElement('input')
                chk.type = 'checkbox'
                chk.id = 'modal-del-nao-perguntar'
                const spanChk = document.createElement('span')
                spanChk.textContent = 'Não perguntar novamente'
                checkWrap.appendChild(chk); checkWrap.appendChild(spanChk)

                const acoes = document.createElement('div')
                Object.assign(acoes.style, {display:'flex', gap:'8px', justifyContent:'flex-end'})

                const btCancelar = document.createElement('button')
                btCancelar.textContent = 'Cancelar'
                btCancelar.id = 'modal-del-cancelar'
                estilizarBotao(btCancelar, false)

                const btExcluir = document.createElement('button')
                btExcluir.textContent = 'Excluir'
                btExcluir.id = 'modal-del-excluir'
                estilizarBotao(btExcluir, true)

                acoes.appendChild(btCancelar); acoes.appendChild(btExcluir)
                caixa.appendChild(titulo); caixa.appendChild(texto); caixa.appendChild(checkWrap); caixa.appendChild(acoes)
                overlay.appendChild(caixa)
                document.body.appendChild(overlay)
            }

            const textoP = overlay.querySelector('#modal-del-texto')
            const chk = overlay.querySelector('#modal-del-nao-perguntar')
            const btCancelar = overlay.querySelector('#modal-del-cancelar')
            const btExcluir = overlay.querySelector('#modal-del-excluir')
            const caixa = overlay.querySelector('#modal-del-caixa')

            textoP.textContent = `“${trecho}” será removida. Essa ação não pode ser desfeita.`

            // abrir
            overlay.style.display = 'grid'
            requestAnimationFrame(() => { overlay.style.opacity = '1'; caixa.style.transform = 'translateY(0)' })
            chk.checked = false

            const sair = (ok) => {
                overlay.style.opacity = '0'
                caixa.style.transform = 'translateY(8px)'
                setTimeout(() => overlay.style.display = 'none', 180)
                if (ok && chk.checked) {
                    prefs.confirmarExclusao = false
                    salvarPrefs(prefs)
                    atualizarSwitchPreferencias()
                    avisar('Confirmação de exclusão desativada. Você pode reativar no switch do rodapé.')
                }
                overlay.removeEventListener('click', clickFora)
                document.removeEventListener('keydown', onKey)
                btCancelar.onclick = null; btExcluir.onclick = null
                resolve(ok)
            }
            const clickFora = (e) => { if (e.target === overlay) sair(false) }
            const onKey = (e) => { if (e.key === 'Escape') sair(false); if (e.key === 'Enter') sair(true) }
            overlay.addEventListener('click', clickFora)
            document.addEventListener('keydown', onKey)
            btCancelar.onclick = () => sair(false)
            btExcluir.onclick  = () => sair(true)
            btExcluir.focus()
        })
    }

    function estilizarBotao(btn, primario) {
        Object.assign(btn.style, {
            appearance:'none', border:'0', padding:'10px 14px',
            borderRadius:'10px', cursor:'pointer', font:'600 14px/1 system-ui'
        })
        if (primario) { btn.style.background = 'linear-gradient(90deg,#8ecae6,#219ebc)'; btn.style.color = '#fff' }
        else { btn.style.background = '#f1f5f9'; btn.style.color = '#111' }
        btn.onmouseenter = () => btn.style.filter = 'brightness(.95)'
        btn.onmouseleave = () => btn.style.filter = ''
        btn.onmousedown  = () => btn.style.transform = 'translateY(1px)'
        btn.onmouseup    = () => btn.style.transform = ''
    }

    // ----------------- CRIAR TAREFA -----------------
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
        btExcluir.setAttribute('aria-label', 'Excluir tarefa')

        const btEditar = document.createElement('button')
        btEditar.id = `btEditar${cont}`
        btEditar.className = 'edit'
        btEditar.setAttribute('aria-label', 'Editar tarefa')

        aFazer.appendChild(textAFazer)
        aFazer.appendChild(checkbox)
        aFazer.appendChild(btExcluir)
        aFazer.appendChild(btEditar)
        campo.appendChild(aFazer)

        if (concluida){ aFazer.classList.add('done'); textAFazer.style.color = '#7bbf8d' }
        cont++

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) { textAFazer.style.color = '#7bbf8d'; aFazer.classList.add('done') }
            else { textAFazer.style.color = '#000000'; aFazer.classList.remove('done') }
            sincronizar()
        })

        // EXCLUIR (mini modal; respeita preferência)
        btExcluir.addEventListener('click', async () => {
            const trecho = textAFazer.textContent.slice(0, 60) + (textAFazer.textContent.length > 60 ? '…' : '')
            const ok = await confirmarExclusaoModal(trecho)
            if (!ok) return
            aFazer.remove()
            sincronizar()
            avisar("Tarefa excluída.")
        })

        // Editar
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
                if (e.key === 'Enter') input.blur()
                else if (e.key === 'Escape') input.parentNode.replaceChild(textAFazer, input)
            })

            textAFazer.parentNode.replaceChild(input, textAFazer)
            input.focus()
            input.select()
        })

        if (salvarNoStorage) sincronizar()
        else atualizarEstatisticas()
    }

    // ----------------- SINCRONIZAR -----------------
    function sincronizar(){
        const lista = Array.from(campo.querySelectorAll('.todo')).map(el => ({
            texto: el.querySelector('.todo-text').textContent,
            concluida: el.classList.contains('done')
        }))
        salvar(lista)
        atualizarEstatisticas()
    }

    // ----------------- ESTATÍSTICAS -----------------
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

    // ----------------- RODAPÉ: SWITCH CENTRALIZADO -----------------
    function montarSwitchPreferencias() {
        let area = document.getElementById('prefs-area')
        if (!area) {
            area = document.createElement('div')
            area.id = 'prefs-area'
            Object.assign(area.style, {
                margin:'24px auto 28px',
                padding:'10px 12px',
                maxWidth:'720px',
                display:'grid',
                placeItems:'center',
                color:'#334155',
                font:'500 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
            })

            // rótulo + ícone
            const rotulo = document.createElement('div')
            rotulo.id = 'prefs-rotulo'
            Object.assign(rotulo.style, {display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', userSelect:'none'})
            const icone = document.createElement('span'); icone.id = 'prefs-icone'
            const texto = document.createElement('span'); texto.id = 'prefs-texto'; texto.textContent = 'Confirmação de exclusão'
            rotulo.appendChild(icone); rotulo.appendChild(texto)

            // switch acessível
            const sw = document.createElement('button')
            sw.id = 'prefs-switch'
            sw.setAttribute('role', 'switch')
            sw.setAttribute('aria-checked', 'false')
            sw.setAttribute('aria-label', 'Alternar confirmação de exclusão')
            Object.assign(sw.style, {
                position:'relative', width:'70px', height:'34px',
                borderRadius:'9999px', border:'0', cursor:'pointer',
                transition:'background .18s ease', outline:'none'
            })

            const bolinha = document.createElement('div')
            bolinha.id = 'prefs-bolinha'
            Object.assign(bolinha.style, {
                position:'absolute', top:'2px', left:'2px',
                width:'30px', height:'30px', borderRadius:'50%',
                background:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,.25)',
                transition:'transform .18s ease'
            })
            sw.appendChild(bolinha)

            // ajuda (opcional)
            const dica = document.createElement('div')
            dica.textContent = '🛈 ON: pede confirmação • OFF: exclui direto'
            Object.assign(dica.style, {marginTop:'8px', fontSize:'12px', color:'#64748b'})

            area.appendChild(rotulo)
            area.appendChild(sw)
            area.appendChild(dica)
            document.body.appendChild(area)

            // click/toggle
            sw.addEventListener('click', () => {
                prefs.confirmarExclusao = !prefs.confirmarExclusao
                salvarPrefs(prefs)
                atualizarSwitchPreferencias()
                avisar(prefs.confirmarExclusao ? 'Confirmação de exclusão ativada.' : 'Confirmação de exclusão desativada.')
            })
            // tecla espaço/enter
            sw.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); sw.click() }
            })
        }
        atualizarSwitchPreferencias()
    }

    function atualizarSwitchPreferencias() {
        const sw = document.getElementById('prefs-switch')
        const bolinha = document.getElementById('prefs-bolinha')
        const icone = document.getElementById('prefs-icone')
        if (!sw || !bolinha || !icone) return

        const on = !!prefs.confirmarExclusao
        sw.setAttribute('aria-checked', String(on))
        // cores do track
        sw.style.background = on ? 'linear-gradient(90deg,#22c55e,#16a34a)' : '#e2e8f0'
        // posição da bolinha
        bolinha.style.transform = on ? 'translateX(36px)' : 'translateX(0)'
        // ícone de estado
        icone.textContent = on ? '🛡️' : '🗑️'
    }

    montarSwitchPreferencias()

    // ----------------- ATALHO: RESETAR PREFERÊNCIAS (opcional) -----------------
    // chama window.resetTodosPrefs() no console pra reativar confirmação
    window.resetTodosPrefs = () => {
        prefs.confirmarExclusao = true
        salvarPrefs(prefs)
        atualizarSwitchPreferencias()
        avisar('Confirmação de exclusão reativada.')
    }
})
