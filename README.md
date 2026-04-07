# EdTech - Plataforma de Ensino

Desenvolvedor(a) Frontend na DOT Digital Group.

Proposta de implementar a página do Figma usando só HTML5, CSS e JavaScript Vanilla — sem React, sem Tailwind, sem framework. Abaixo explico como rodei o projeto, como organizei o código e o porquê das decisões que tomei.

---

## Como Rodar

```bash
git clone https://github.com/seu-usuario/edtech-frontend-challenge.git
cd edtech-frontend-challenge
```

Abre o `index.html` direto no navegador. Não tem `npm install`, não tem build, não tem nada pra instalar. É HTML, CSS e JS puro.

---

## Decisões Técnicas

### Como organizei o projeto

Uma coisa que me incomoda em projetos vanilla é quando vira aquele CSS gigante e um JS monolítico. Pra evitar isso, separei cada componente no seu próprio arquivo — tanto o CSS quanto o JS.

No CSS, o `index.css` funciona como ponto de entrada único e importa tudo na ordem certa: primeiro as variáveis, depois o reset, o base e por último os componentes. Cada componente (hero, video, slider, cards...) tem seu próprio `.css`, seguindo BEM pra nomenclatura.

No JS, criei um `main.js` como ponto de entrada único — é o único script chamado no HTML, com `type="module"`. Ele importa todos os outros na ordem certa. Cada arquivo é encapsulado numa IIFE — `(() => { ... })()` — então nenhum componente vaza variável pro escopo. A única coisa global é o objeto `EdTech` no `utils.js`, que expõe funções reutilizadas por mais de um componente (`formatTime` e `makeDraggable`).

Outra decisão que tomei foi separar as responsabilidades entre CSS e JS: classes CSS servem só pra estilização, e toda seleção de elementos no JavaScript é feita via `data-*` attributes (`data-video-play`, `data-slider-prev`, `data-activity-submit`). Se amanhã eu precisar renomear uma classe BEM, o JS não quebra. E vice-versa.

Todas as cores, fontes, espaçamentos, sombras e raios de borda ficam centralizados no `variables.css` como Custom Properties. Não tem nenhum `#76b900` ou `16px` solto nos componentes — tudo referencia o token. Isso mantém a consistência e facilita muito qualquer ajuste visual.

---

### Performance

Os scripts todos carregam com `defer`, então não bloqueiam o parsing do HTML. As fontes do Google usam `<link rel="preconnect">` pros dois domínios (`fonts.googleapis.com` e `fonts.gstatic.com` com `crossorigin`), o que elimina a latência de DNS e TLS antes de começar a baixar a fonte.

O `<video>` e o `<audio>` usam `preload="metadata"` — só baixam a duração e dimensões, sem puxar o arquivo inteiro de cara.

Pro YouTube, fiz lazy loading: o iframe só é criado no momento que o usuário clica play. Antes disso é só a imagem de poster. Isso evita carregar os ~500KB de scripts do YouTube logo no carregamento da página.

As animações de scroll usam `IntersectionObserver` ao invés de listener no scroll. E cada elemento é desvinculado (`unobserve`) depois de revelado — é uma observação única, sem custo contínuo de performance.

No hero, os elementos de blur usam `contain: layout paint` pra dizer pro browser que aquele efeito não afeta nada fora do container, o que ajuda na composição. O slider usa `translateX` pra deslizar, que roda na GPU sem causar reflow. E todos os touch listeners que não precisam chamar `preventDefault()` são marcados com `{ passive: true }` — os de drag, que precisam prevenir o scroll, usam `{ passive: false }`.

---

### Acessibilidade

Esse foi um ponto que me dediquei bastante, mesmo sendo diferencial e não obrigatório.

O primeiro elemento do body é um skip link — "Pular para o conteúdo" — que aparece só no foco por teclado. É o WCAG 2.4.1.

Toda section tem label. As que possuem título visível usam `aria-labelledby` apontando pro heading. As que não têm título visível (slider, podcast, destaque, cards) recebem um `<h2 class="sr-only">` pra garantir que todo landmark tem nome acessível.

Sobre o `.sr-only`: optei por usar `clip` ao invés de `transform` pra esconder os elementos. O motivo é que `transform` pode causar um flash visual no carregamento, enquanto `clip: rect(0,0,0,0)` esconde sem efeito colateral.

Nos players de vídeo e áudio, todos os sliders (progresso e volume) têm `role="slider"` com `aria-valuemin`, `aria-valuemax` e `aria-valuenow` atualizados pelo JS. Os controles de vídeo ficam dentro de um `role="toolbar"`, e o menu de velocidade do podcast suporta navegação por teclado (ArrowUp/Down pra navegar, Escape pra fechar).

Nos cards, os botões Abrir/Fechar usam `aria-expanded` e `aria-controls` vinculado ao `id` do conteúdo. E depois de abrir ou fechar, o foco move automaticamente pro botão relevante.

O slider recebe `aria-roledescription="carrossel"` e `aria-live="polite"` no track, então mudanças de slide são anunciadas pra leitores de tela.

Apliquei `prefers-reduced-motion: reduce` em todos os componentes. Cada CSS de componente tem esse bloco de media query desabilitando transições. O `text-highlight.js` checa essa preferência no JS e pula a animação letra-a-letra. O `scroll-reveal.css` remove os transforms e mostra tudo de imediato.

O `:focus-visible` tá definido globalmente no `base.css` — outline verde de 2px com offset. Qualquer elemento que tenha focus na página ganha esse indicador, sem afetar cliques com mouse.

Na atividade objetiva, as opções ficam dentro de `<fieldset>/<legend>`, com o legend em `.sr-only` anunciando "Selecione uma alternativa".

---

### Responsividade

A abordagem é mobile-first. Os estilos base são pra mobile e as media queries (768px e 1024px) vão adicionando o que precisa pro desktop.

A tipografia é fluida com `clamp()` — o texto não salta de tamanho entre breakpoints, ele escala continuamente. Por exemplo, o título do hero vai de 36px no mobile até 72px no desktop: `clamp(2.25rem, 1.3rem + 4vw, 4.5rem)`. Fiz a mesma coisa pros espaçamentos: `--spacing-page-margin: clamp(1rem, -1.9rem + 12.4vw, 8rem)` adapta a margem lateral sem breakpoint fixo.

No hero usei `100dvh` ao invés de `100vh`. O `dvh` leva em conta a barra de endereço retrátil dos browsers mobile, então não fica aquele scroll estranho no celular.

Uma decisão que pode passar despercebida: o `line-height` dos títulos é `1.05`, não `1`. O `1` corta descendentes (as letras g, p, y) em fontes grandes. O `1.05` preserva a legibilidade sem adicionar espaçamento demais.

O letter-spacing usa `em` ao invés de `px`. Assim ele escala junto com o font-size — o tracking do hero (72px) e das sections (48px) são o mesmo valor em `em`, mas resultam em pixels diferentes porque escalam proporcionalmente.

Quanto aos componentes: a imagem lateral vira grid `2fr 3fr` no desktop. Cards e FAQ itens extras ficam escondidos no mobile pra não gerar scroll infinito, e aparecem a partir de 768px. O grupo de volume do podcast some em telas abaixo de 480px onde o espaço é limitado.

---

### Player de Vídeo

O player suporta duas fontes: YouTube e vídeo local. Tudo depende de um atributo `data-youtube-id` no HTML. Quando ele existe, o JS exibe a thumbnail de poster e, ao clicar play, cria o iframe do YouTube com `autoplay=1`. Quando não existe, o player customizado com controles próprios inicializa normalmente. Pra alternar entre as duas fontes, basta adicionar ou remover o atributo — sem mexer em JS nenhum.

Um problema que enfrentei foi o touch em dispositivos híbridos tipo Surface. Se eu usasse um flag `isTouchDevice` permanente, quebraria a alternância entre touch e mouse. A solução que encontrei: gravo o timestamp do último `touchstart` e, no `click`, comparo — se a diferença é menor que 500ms, sei que o click veio de um toque. Assim decido se mostro/escondo os controles (touch) ou se alterno play/pause (mouse).

Na parte touch, quando o vídeo tá tocando e o usuário toca na tela, os controles aparecem e somem depois de 3 segundos. Coloquei um `stopPropagation` no `touchstart` da barra de controles pra que toques nos botões não sejam interpretados como toque no vídeo.

Os sliders de progresso e volume do vídeo têm drag com listeners separados de mouse e touch. Já no podcast, usei a Pointer Events API (`pointerdown/pointermove/pointerup`) que unifica os dois. Quis usar as duas abordagens no projeto pra mostrar que conheço ambas.

Implementei atalhos de teclado seguindo as convenções do YouTube: `Space`/`K` pra play, setas horizontais pra seek ±5s, setas verticais pra volume, `F` pra fullscreen, `M` pra mute.

Quando o `video.play()` é interrompido por um `pause()` imediato, o browser lança um `AbortError`. Trato isso especificamente — ignoro o AbortError (que é esperado) e só logo erros reais.

Quando o vídeo termina, faço `video.load()` pra resetar o player e voltar a mostrar o poster original. E ao sair de fullscreen, um `scrollIntoView` reposiciona a página, porque o browser pode rolar pra uma posição inesperada durante o fullscreen.

---

### Atividades e Persistência

As duas atividades foram feitas inteiramente do zero, sem nenhum plugin.

A persistência usa `sessionStorage`. Cada interação (digitar no textarea, selecionar uma opção, clicar em Responder ou Alterar) salva o estado completo como JSON. Quando a página recarrega, o `restore()` recupera tudo: o texto digitado, a opção marcada, se o feedback tava visível, e o estado de cada botão (habilitado/desabilitado). Protegi o `JSON.parse` com `try/catch` pra caso o storage tenha dado corrompido.

Na atividade objetiva, usei `<input type="checkbox">` conforme o PDF pedia. O input nativo fica escondido em `.sr-only` e um checkbox visual customizado é feito via CSS, usando `background-image` de um SVG de check. O JS coleta as seleções com `.filter(c => c.checked)`, funcionando tanto pra uma quanto pra várias marcações.

---

### FAQ (Accordion)

O accordion usa `<details>/<summary>`, que é nativo do HTML — conforme o teste pedia. Sem JavaScript, o FAQ já abre e fecha normalmente. O JS entra pra adicionar a animação e o comportamento de accordion (só um item aberto por vez).

A animação de altura usa `grid-template-rows: 0fr → 1fr`. Essa técnica resolve aquele problema clássico de que o CSS não consegue transicionar `height: 0 → auto` — com grid rows, a altura anima suavemente até o tamanho natural do conteúdo, sem precisar definir um valor fixo.

Um detalhe que deu trabalho: pra animação de abertura funcionar, preciso de um double `requestAnimationFrame`. Primeiro adiciono o atributo `open` (pro DOM renderizar o conteúdo), e só no segundo frame adiciono a classe CSS que dispara a transição. Sem isso, o browser colapsa as duas mudanças no mesmo frame e a animação não acontece.

Também coloquei um lock (`animating = true`) que impede cliques durante a transição. O `transitionend` reseta a flag, e a remoção do atributo `open` só acontece depois que o fechamento visual terminar.

---

### Animações e Microinterações

O scroll reveal aceita delays customizáveis via `data-reveal="150"`. Dentro de uma mesma seção, os elementos usam delays crescentes (0, 100, 200...) pra criar um efeito de cascata na entrada.

No hero, a palavra destacada tem uma animação letra-a-letra. O JS quebra o texto em `<span>` individuais e anima cada um com delay progressivo. O ciclo é: ativa letra por letra → segura → desativa todas → pausa → repete. Coloquei uma checagem com `el.isConnected` pra interromper o ciclo caso o elemento saia do DOM, evitando memory leak.

Sem JavaScript, o texto do highlight continua verde pela classe CSS `.hero__highlight`. O JS é só uma camada visual extra — progressive enhancement.

Os cards abrem com uma animação de reveal: `opacity 0→1` com `scale 0.96→1` em 350ms. E o dashboard do hero usa `backdrop-filter: blur(8px)` com um fallback via `@supports not` pra browsers que não suportam — nesse caso aplica um background sólido.

---

## Estrutura do Projeto

```
edtech-frontend-challenge/
├── index.html                  # Página principal
├── styles/
│   ├── index.css               # Importa tudo na ordem certa
│   ├── variables.css           # Design tokens
│   ├── reset.css               # Reset moderno
│   ├── base.css                # Body, layout, focus-visible, sr-only, skip-link
│   └── components/
│       ├── hero.css
│       ├── video.css
│       ├── lateral.css
│       ├── slider.css
│       ├── destaque.css
│       ├── cards.css
│       ├── intro.css
│       ├── podcast.css
│       ├── activity.css
│       ├── faq.css
│       ├── footer.css
│       └── reveal.css
├── scripts/
│   ├── main.js                 # Entry point — importa todos os módulos
│   ├── utils.js                # formatTime, makeDraggable
│   ├── video-player.js         # Player de vídeo (YouTube + local)
│   ├── slider.js               # Carrossel de imagens
│   ├── cards.js                # Cards interativos
│   ├── podcast.js              # Player de áudio
│   ├── activity.js             # Atividades com sessionStorage
│   ├── faq.js                  # Accordion animado
│   ├── scroll-reveal.js        # Animação de entrada
│   └── text-highlight.js       # Animação letra-a-letra
└── assets/
    ├── icons/
    ├── images/
    ├── audio/
    └── videos/
```
