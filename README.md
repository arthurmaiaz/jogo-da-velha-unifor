# Jogo da Velha Web — UNIFOR

Aplicação web de Jogo da Velha desenvolvida conforme a Especificação de Requisitos Funcionais (CDU) da disciplina, com suporte a modo 2 Jogadores (PVP) e Contra o Computador, formatos Partida Única e Melhor de 3 (MD3), efeitos sonoros sintetizados via Web Audio API, linha de vitória animada e confetes.

- **Aluno(a):** Arthur Maia, Nikolas Vianna, Leticia Ayumi
- **Matrícula:** 2310641 - 2623878 - 2612739
- **Link público (GitHub Pages):** https://github.com/arthurmaiaz/jogo-da-velha-unifor

## Estrutura do repositório

```
.
├── README.md
├── RELATORIO_PROMPTS.md
└── src/
    └── index.html   ← aplicação completa (HTML + CSS + JS em um único arquivo)
└── dev/
    └── index.html  ← HTML = estrutura
    └── script.js   ← JS = comportamento/função
    └── style.css   ← CSS = estilo
```

O arquivo `src/index.html` não possui nenhuma dependência de mídia externa salva localmente: a logo da UNIFOR está embutida em base64 e todos os efeitos sonoros são gerados em tempo real pela Web Audio API (sem `.mp3`, `.wav` ou downloads).

## Como executar localmente

Não é necessário nenhum servidor ou instalação. Basta:

1. Baixar/clonar este repositório.
2. Abrir o arquivo `src/index.html` diretamente no navegador (duplo clique, ou clique direito → "Abrir com" → navegador de sua preferência).

Opcionalmente, para recarregamento automático durante edições, é possível usar a extensão **Live Server** do VSCode.

## Como jogar

1. Escolha o **Modo de Jogo**: 2 Jogadores (PVP) ou Contra o Computador.
2. Escolha o **Formato da Partida**: Partida Única ou Melhor de 3 (MD3).
3. Clique nas células do tabuleiro para jogar. O jogador X sempre começa.
4. Ao final, use o botão **Reiniciar Jogo** para zerar o placar e recomeçar.

## Publicação via GitHub Pages

Como o arquivo principal fica em `src/index.html` (e não na raiz do repositório), o GitHub Pages — que só publica automaticamente a partir da raiz (`/`) ou da pasta `/docs` de uma branch — precisa de um pequeno redirecionamento. Passos usados:

1. Em **Settings → Pages**, configurar "Deploy from a branch", branch `main`, pasta `/ (root)`.
2. Um `index.html` na raiz do repositório redireciona para `src/index.html` (mantendo a estrutura de pastas exigida pelo enunciado).
3. O link gerado pelo GitHub Pages fica disponível em `https://github.com/arthurmaiaz/jogo-da-velha-unifor.git` e é o mesmo informado no topo deste README.

## Tecnologias utilizadas

- HTML5, CSS3 (Grid Layout, custom properties, animações via `@keyframes`)
- JavaScript (vanilla, sem frameworks ou bibliotecas externas)
- Web Audio API (efeitos sonoros sintetizados)
- Canvas 2D (animação de confetes)
