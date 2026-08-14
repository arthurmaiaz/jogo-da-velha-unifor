# Relatório de Prompts — Jogo da Velha Web (UNIFOR)

## 1. Identificação

- **Aluno(a):** Arthur Maia, Nikolas Vianna, Leticia Ayumi
- **Matrícula:** 2310641 - 2623878 - 2612739
- **IA utilizada:** Claude (Anthropic), via claude.ai
- **Projeto:** Jogo da Velha Web — Especificação de Requisitos Funcionais (CDU) — UNIFOR

## 2. Metodologia

O desenvolvimento foi feito em ciclos de prompt → geração → teste manual → correção. A IA gerou a versão inicial completa (HTML/CSS/JS em arquivo único) a partir do CDU fornecido, e as rodadas seguintes consistiram em reportar comportamento observado (via prints de tela) para a IA localizar a causa no código e corrigir.

## 3. Prompts enviados (resumo cronológico)

| # | Prompt (resumido) | Objetivo |
|---|---|---|
| 1 | "Implemente o jogo da velha exatamente conforme o CDU anexado" | Geração inicial: RF-01 a RF-08, modos PVP/CPU, MD3, sons sintetizados, linha de vitória, confetes, placar |
| 2 | "Adicione a logo da universidade" | Inserção do brasão da UNIFOR embutido em base64 no cabeçalho |
| 3 | "Consigo separar o projeto em HTML/CSS/JS pelo VSCode? Mostre como juntar" | Separação em `index.html`, `style.css`, `script.js` com explicação de `<link>`/`<script src>` |
| 4 | "A tabela do jogo não fica estática ao selecionar os quadrados" (com prints) | Diagnóstico e correção de instabilidade visual no tabuleiro |
| 5 | "Ainda continua igual, corrija sem erros" (com print detalhado do bug) | Identificação da causa raiz real: linha central do grid encolhendo |
| 6 | "Corrija a linha traçada ao jogador vencer" (com print do desalinhamento) | Correção do cálculo geométrico da linha de vitória |
| 7 | "Monte os conteúdos obrigatórios: src/index.html, README.md, RELATORIO_PROMPTS.md" | Preparação dos entregáveis finais do projeto |
| 8 | "Adicione confetes ao jogador que ganhou a partida" | Ajuste de regra: confete só na vitória da partida (não em toda rodada do MD3) |
| 9 | Envio da tabela de elementos de UI (UI-01 a UI-11) | Auditoria do código contra a especificação de UI |
| 10 | Envio da tabela de Critérios de Aceite (CA-01 a CA-07) | Base para a autoavaliação deste relatório |

## 4. Erros cometidos pela IA em relação ao CDU e como foram corrigidos

### 4.1 Instabilidade visual ao clicar nas células (efeito de "encolhimento")
**Causa raiz real:** o `.board` definia `grid-template-columns` mas não `grid-template-rows`. Sem isso, o navegador dimensiona as linhas do grid automaticamente a partir do conteúdo de cada célula. Como `<button>` tem um tamanho mínimo padrão baseado no próprio conteúdo (`min-width`/`min-height: auto`), a linha do meio (sem X/O) podia ser espremida quando as linhas de cima e de baixo recebiam símbolos.
**Como foi corrigido:** a IA cometeu duas tentativas intermediárias antes de chegar à causa certa:
1ª tentativa (insuficiente): removeu `transform: scale(.95)` do estado `:active` da célula, que causava um encolhimento momentâneo no clique — real, mas não era o bug principal relatado.
2ª tentativa (insuficiente): corrigiu o estado de `:hover` "grudado" em toque (mobile), adicionando `@media (hover:hover)` e `-webkit-tap-highlight-color: transparent` — também real, mas ainda não resolvia o encolhimento da linha central.
3ª tentativa (correta): a partir de um print com medição de pixels solicitada pelo usuário, a IA identificou a ausência de `grid-template-rows: repeat(3,1fr)` e de `min-width:0; min-height:0` nas células como causa raiz, e corrigiu.
**Ordenação da correção:** o usuário reportou o problema três vezes com prints cada vez mais específicos até a IA isolar a causa certa; a terceira correção resolveu definitivamente.

### 4.2 Linha de vitória desalinhada em jogadas diagonais
**Causa raiz:** a função `drawWinLine` estendia a linha além das pontas usando deslocamentos fixos em pixels nos eixos X e Y (`x1 - 17`, `y1 - 3`), o que só é geometricamente correto para linhas horizontais/verticais. Em diagonais, isso deslocava a linha inteira para o canto, fazendo-a passar ao lado dos símbolos vencedores em vez de sobre eles.
**Como foi corrigido:** o usuário reportou "a linha está errada" com um print mostrando o desvio. A IA recalculou o deslocamento usando um vetor unitário na direção real da linha (`ux, uy`), estendendo a linha corretamente ao longo do próprio ângulo, para qualquer padrão vitorioso (linha, coluna ou diagonal).

### 4.3 Confete disparando em toda rodada do MD3, não apenas na vitória da partida
**Causa raiz:** a implementação original dos RF-06 chamava `launchConfetti()` em toda vitória de rodada, inclusive nas rodadas intermediárias do formato Melhor de 3 — o CDU não deixava explícito se o confete era por rodada ou por partida.
**Como foi corrigido:** o usuário pediu explicitamente que o confete fosse reservado ao vencedor da partida. A IA moveu a chamada de `launchConfetti()` para dentro da condição que declara o campeão do MD3, mantendo o disparo imediato apenas na Partida Única (onde rodada = partida).

### 4.4 Divergências de caixa alta contra a tabela de UI (UI-01, UI-02, UI-11)
**Causa raiz:** o subtítulo institucional, o título principal e o texto do botão de reinício foram implementados em title case, enquanto a especificação de UI definia esses três campos como texto em caixa alta.
**Como foi corrigido:** ao receber a tabela UI-01 a UI-11, a IA auditou o HTML/CSS renderizado contra cada linha da tabela e aplicou `text-transform: uppercase` nos três seletores correspondentes (`.eyebrow`, `h1`, `.btn-restart`).

## 5. Autoavaliação — Critérios de Aceite (CA-01 a CA-07)

| Critério | Descrição | Status | Evidência |
|---|---|---|---|
| CA-01 | Fidelidade Visual — paleta institucional (`#003366`, `#0056b3`) e subtítulo "UNIVERSIDADE DE FORTALEZA" | ✅ Atendido | Variáveis `--azul-unifor`/`--azul-destaque` no CSS; `.eyebrow` em caixa alta (corrigido no item 4.4) |
| CA-02 | Regra de Ocupação — não sobrescreve célula com `'X'`/`'O'` | ✅ Atendido | `handleCellClick`: `if(options[index] !== '') return;` |
| CA-03 | Bloqueio pós-fim de jogo — tabuleiro trava até próxima rodada/reinício | ✅ Atendido | `handleCellClick`: `if(!running) return;` (checado antes da checagem de ocupação, cobrindo inclusive células vazias) |
| CA-04 | Comportamento do Modo CPU — jogada automática do 'O' após pausa | ✅ Atendido | `if(modeSelect === 'cpu' && currentPlayer === 'O'){ running=false; setTimeout(cpuMove, 400); }` |
| CA-05 | Regra do Melhor de 3 — zera tabuleiro entre rodadas, encerra com 2 vitórias ou após a 3ª rodada | ✅ Atendido | `handleRoundWin`: checa `winsX===2 \|\| winsO===2` (encerra) e `currentRound < target` (nova rodada) |
| CA-06 | Efeitos Visuais de Vitória — linha sobre as 3 células, confetes disparados | ✅ Atendido | `drawWinLine` corrigido (item 4.2); `launchConfetti()` corrigido para disparar na vitória da partida (item 4.3) |
| CA-07 | Autonomia de Áudio — efeitos sonoros sem `.mp3`/downloads externos | ✅ Atendido | Todo áudio gerado via osciladores da Web Audio API (`AudioContext`, `createOscillator`), sem `<audio>` nem arquivos externos |

**Resultado geral:** 7 de 7 critérios atendidos após as correções documentadas na seção 4.

## 6. Observações finais

Os principais erros da IA neste projeto não foram de funcionalidade ausente, e sim de **causa raiz mal diagnosticada na primeira tentativa** (itens 4.1) — a IA corrigiu sintomas reais, porém secundários, antes de chegar ao problema central relatado pelo usuário. Isso reforça a importância de fornecer evidências específicas (prints com medição de pixels, descrição exata do gatilho do bug) ao reportar problemas para a IA.
