<div align="center">

# EdTech - Plataforma de Ensino

Teste técnico para a vaga de Desenvolvedor(a) Frontend na **DOT Digital Group**

<br />

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

![Status](https://img.shields.io/badge/status-concluído-brightgreen?style=flat-square)
![Responsive](https://img.shields.io/badge/responsivo-mobile%20%2B%20desktop-blue?style=flat-square)
![Accessibility](https://img.shields.io/badge/acessibilidade-WCAG%202.1-purple?style=flat-square)
![No Frameworks](https://img.shields.io/badge/frameworks-nenhum-red?style=flat-square)

<br />

[Como Rodar](#como-rodar) · [Decisões Técnicas](#decisões-técnicas) · [Estrutura](#estrutura-do-projeto)

</div>

<br />

## Sobre

A proposta era implementar a página do Figma usando só HTML5, CSS e JavaScript Vanilla — sem React, sem Tailwind, sem nada. Abaixo explico como organizei o código e o porquê das decisões que tomei.

<br />

## Como Rodar

```bash
git clone https://github.com/juninalmeida/edtech-frontend-challenge.git
cd edtech-frontend-challenge
```

Abre o `index.html` direto no navegador. Não tem `npm install`, não tem build, não tem nada pra instalar. É HTML, CSS e JS puro.

<br />

## Componentes

<table>
  <tr>
    <td align="center" width="140"><strong>Player de Vídeo</strong><br /><sub>YouTube + local</sub></td>
    <td align="center" width="140"><strong>Slider</strong><br /><sub>3 imagens, do zero</sub></td>
    <td align="center" width="140"><strong>Player de Áudio</strong><br /><sub>Controle de velocidade</sub></td>
    <td align="center" width="140"><strong>Cards Interativos</strong><br /><sub>Abrir / Fechar</sub></td>
  </tr>
  <tr>
    <td align="center" width="140"><strong>Atividade Discursiva</strong><br /><sub>sessionStorage</sub></td>
    <td align="center" width="140"><strong>Atividade Objetiva</strong><br /><sub>Checkbox + persistência</sub></td>
    <td align="center" width="140"><strong>FAQ Accordion</strong><br /><sub>details/summary nativo</sub></td>
    <td align="center" width="140"><strong>Scroll Reveal</strong><br /><sub>IntersectionObserver</sub></td>
  </tr>
</table>

<br />

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

| Recurso | Implementação |
|---------|---------------|
| **Skip Link** | Primeiro elemento do body, visível apenas no foco por teclado (WCAG 2.4.1) |
| **Landmarks** | Toda `<section>` com `aria-labelledby` ou `<h2 class="sr-only">` |
| **Sliders** | `role="slider"` com `aria-valuemin/max/now` atualizados pelo JS |
| **Cards** | `aria-expanded` + `aria-controls` com foco automático pós-toggle |
| **Carousel** | `aria-roledescription="carrossel"` + `aria-live="polite"` no track |
| **Reduced Motion** | `prefers-reduced-motion: reduce` em todos os componentes |
| **Focus** | `:focus-visible` global com outline verde de 2px |
| **Formulários** | `<fieldset>/<legend>` na atividade objetiva |

Sobre o `.sr-only`: optei por usar `clip` ao invés de `transform` pra esconder os elementos. O motivo é que `transform` pode causar um flash visual no carregamento, enquanto `clip: rect(0,0,0,0)` esconde sem efeito colateral.

Nos players de vídeo e áudio, os controles de vídeo ficam dentro de um `role="toolbar"`, e o menu de velocidade do podcast suporta navegação por teclado (ArrowUp/Down pra navegar, Escape pra fechar).

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

Adicionei um `setTimeout` de fallback no `transitionend` — se a transição não disparar por qualquer motivo (browser pular o frame, elemento oculto), o fallback garante que o accordion nunca trave.

---

### Animações e Microinterações

O scroll reveal aceita delays customizáveis via `data-reveal="150"`. Dentro de uma mesma seção, os elementos usam delays crescentes (0, 100, 200...) pra criar um efeito de cascata na entrada.

No hero, a palavra destacada tem uma animação letra-a-letra. O JS quebra o texto em `<span>` individuais e anima cada um com delay progressivo. O ciclo é: ativa letra por letra → segura → desativa todas → pausa → repete. Coloquei uma checagem com `el.isConnected` pra interromper o ciclo caso o elemento saia do DOM, evitando memory leak.

Sem JavaScript, o texto do highlight continua verde pela classe CSS `.hero__highlight`. O JS é só uma camada visual extra — progressive enhancement.

Os cards abrem com uma animação de reveal: `opacity 0→1` com `scale 0.96→1` em 350ms. E o dashboard do hero usa `backdrop-filter: blur(8px)` com um fallback via `@supports not` pra browsers que não suportam — nesse caso aplica um background sólido.

<br />

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

<br />

<div align="center">
  <sub>Desenvolvido por <strong>Junior Almeida</strong> como teste técnico para a DOT Digital Group.</sub>
</div>
