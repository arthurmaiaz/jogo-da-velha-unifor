(function(){
  "use strict";

  let options = Array(9).fill('');
  let currentPlayer = 'X';
  let running = true;
  let winsX = 0;
  let winsO = 0;
  let currentRound = 1;
  let modeSelect = 'pvp';
  let formatSelect = 'single';

  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  const boardEl = document.getElementById('board');
  const winLineEl = document.getElementById('winLine');
  const statusEl = document.getElementById('status');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const labelOEl = document.getElementById('labelO');
  const roundValueEl = document.getElementById('roundValue');
  const modeSelectEl = document.getElementById('modeSelect');
  const formatSelectEl = document.getElementById('formatSelect');
  const restartBtn = document.getElementById('restartBtn');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas.getContext('2d');

  function buildBoard(){
    boardEl.querySelectorAll('.cell').forEach(c => c.remove());
    for(let i=0;i<9;i++){
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.dataset.index = i;
      btn.setAttribute('aria-label', 'Célula ' + (i+1));
      btn.addEventListener('click', () => handleCellClick(i));
      boardEl.appendChild(btn);
    }
  }
  buildBoard();

  let audioCtx = null;
  function getAudioCtx(){
    if(!audioCtx){
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    if(audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, duration, type, startTime, gainPeak){
    const ac = getAudioCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainPeak || 0.18, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  function playMoveSound(symbol){
    const ac = getAudioCtx();
    const t = ac.currentTime;
    if(symbol === 'X'){
      tone(523.25, 0.14, 'triangle', t, 0.16); 
    } else {
      tone(392.00, 0.16, 'sine', t, 0.16); 
    }
  }

  function playWinSound(){
    const ac = getAudioCtx();
    const t = ac.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
      tone(f, 0.35, 'triangle', t + idx*0.09, 0.14);
    });
  }

  function playDrawSound(){
    const ac = getAudioCtx();
    const t = ac.currentTime;
    [440, 349.23, 293.66].forEach((f, idx) => {
      tone(f, 0.28, 'sawtooth', t + idx*0.11, 0.10);
    });
  }


  function totalRounds(){
    return formatSelect === 'bo3' ? 3 : 1;
  }

  function updateRoundDisplay(){
    roundValueEl.textContent = currentRound + '/' + totalRounds();
  }

  function updateScoreboard(){
    scoreXEl.textContent = winsX;
    scoreOEl.textContent = winsO;
  }

  function bumpScore(el){
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  function setStatus(text, kind){
    statusEl.textContent = text;
    statusEl.classList.remove('win','draw');
    if(kind) statusEl.classList.add(kind);
  }

  function opponentLabel(){
    return modeSelect === 'cpu' ? 'o Computador' : 'o Jogador O';
  }

  function currentTurnLabel(){
    if(currentPlayer === 'O' && modeSelect === 'cpu') return 'Vez do Computador';
    return 'Vez do Jogador ' + currentPlayer;
  }

  labelOEl.textContent = modeSelect === 'cpu' ? 'Computador' : 'Jogador O';


  function evaluateBoard(){
    for(const pattern of winPatterns){
      const [a,b,c] = pattern;
      if(options[a] && options[a] === options[b] && options[a] === options[c]){
        return { type:'win', pattern, symbol: options[a] };
      }
    }
    if(options.every(v => v !== '')){
      return { type:'draw' };
    }
    return null;
  }


  function handleCellClick(index){
    if(!running) return;
    if(options[index] !== '') return;
    placeMark(index, currentPlayer);
  }

  function placeMark(index, symbol){
    options[index] = symbol;
    const cellEl = boardEl.querySelector('.cell[data-index="'+index+'"]');
    cellEl.textContent = symbol;
    cellEl.dataset.symbol = symbol;
    cellEl.disabled = true;
    cellEl.classList.add('pop');
    playMoveSound(symbol);

    const result = evaluateBoard();

    if(result && result.type === 'win'){
      handleRoundWin(result.symbol, result.pattern);
      return;
    }
    if(result && result.type === 'draw'){
      handleRoundDraw();
      return;
    }


    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setStatus(currentTurnLabel());


    if(modeSelect === 'cpu' && currentPlayer === 'O'){
      running = false;
      setTimeout(cpuMove, 400);
    }
  }


  function cpuMove(){
    const idx = chooseCpuMove();
    running = true;
    if(idx !== -1){
      placeMark(idx, 'O');
    }
  }

  function chooseCpuMove(){
    const empty = options.map((v,i)=>v===''?i:-1).filter(i=>i!==-1);
    if(empty.length === 0) return -1;


    for(const i of empty){
      const copy = options.slice(); copy[i]='O';
      if(patternWins(copy,'O')) return i;
    }

    for(const i of empty){
      const copy = options.slice(); copy[i]='X';
      if(patternWins(copy,'X')) return i;
    }

    if(options[4] === '') return 4;

    const corners = [0,2,6,8].filter(i=>options[i]==='');
    if(corners.length) return corners[Math.floor(Math.random()*corners.length)];

    const edges = [1,3,5,7].filter(i=>options[i]==='');
    if(edges.length) return edges[Math.floor(Math.random()*edges.length)];
    return empty[0];
  }

  function patternWins(arr, symbol){
    return winPatterns.some(p => p.every(i => arr[i] === symbol));
  }


  function handleRoundWin(symbol, pattern){
    running = false;
    drawWinLine(pattern);
    playWinSound();

    if(symbol === 'X'){ winsX++; bumpScore(scoreXEl); }
    else { winsO++; bumpScore(scoreOEl); }
    updateScoreboard();

    const winnerLabel = symbol === 'X' ? 'Jogador X' : (modeSelect==='cpu' ? 'Computador' : 'Jogador O');
    setStatus(winnerLabel + ' venceu a rodada!', 'win');

    const target = totalRounds();

    if(formatSelect === 'bo3'){
      if(winsX === 2 || winsO === 2){

        const champion = winsX === 2 ? 'Jogador X' : (modeSelect==='cpu' ? 'Computador' : 'Jogador O');
        launchConfetti();
        setTimeout(() => setStatus(champion + ' é o campeão da partida!', 'win'), 900);
        return; 
      }
      if(currentRound < target){

        setTimeout(() => {
          currentRound++;
          updateRoundDisplay();
          startNewRound();
        }, 2000);
        return;
      }
    }

    launchConfetti();
  }

  function handleRoundDraw(){
    running = false;
    playDrawSound();
    setStatus('Rodada Empatada!', 'draw');

    const target = totalRounds();
    if(formatSelect === 'bo3' && currentRound < target){
      setTimeout(() => {
      
        startNewRound();
      }, 2000);
    }
  }


  function startNewRound(){
    options = Array(9).fill('');
    boardEl.querySelectorAll('.cell').forEach(c => {
      c.textContent = '';
      c.disabled = false;
      c.removeAttribute('data-symbol');
    });
    hideWinLine();
    currentPlayer = 'X';
    running = true;
    setStatus(currentTurnLabel());
  }


  function resetMatch(){
    winsX = 0;
    winsO = 0;
    currentRound = 1;
    updateScoreboard();
    updateRoundDisplay();
    startNewRound();
  }

  function drawWinLine(pattern){
    const [a,,c] = pattern;
    const cellA = boardEl.querySelector('.cell[data-index="'+a+'"]');
    const cellC = boardEl.querySelector('.cell[data-index="'+c+'"]');
    const boardRect = boardEl.getBoundingClientRect();
    const rectA = cellA.getBoundingClientRect();
    const rectC = cellC.getBoundingClientRect();

    const x1 = rectA.left + rectA.width/2 - boardRect.left;
    const y1 = rectA.top + rectA.height/2 - boardRect.top;
    const x2 = rectC.left + rectC.width/2 - boardRect.left;
    const y2 = rectC.top + rectC.height/2 - boardRect.top;

    const dx = x2 - x1, dy = y2 - y1;
    const segLength = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;


    const ux = dx / segLength, uy = dy / segLength;
    const overshoot = 17; 
    const startX = x1 - ux * overshoot;
    const startY = y1 - uy * overshoot;
    const length = segLength + overshoot * 2;

    winLineEl.style.width = length + 'px';
    winLineEl.style.left = startX + 'px';
    winLineEl.style.top = (startY - 3) + 'px'; 
    winLineEl.style.transform = 'rotate(' + angle + 'deg)';
    winLineEl.classList.add('show');
  }

  function hideWinLine(){
    winLineEl.classList.remove('show');
    winLineEl.style.width = '0px';
  }


  function resizeCanvas(){
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const confettiColors = ['#003366','#0056b3','#d97706','#f4f6f9','#ffffff'];
  let particles = [];
  let confettiRAF = null;

  function launchConfetti(){
    particles = [];
    const originX = confettiCanvas.width / 2;
    for(let i=0;i<120;i++){
      particles.push({
        x: originX + (Math.random()-0.5)*140,
        y: -20 - Math.random()*80,
        vx: (Math.random()-0.5)*5,
        vy: 2 + Math.random()*4,
        size: 5 + Math.random()*6,
        color: confettiColors[Math.floor(Math.random()*confettiColors.length)],
        rotation: Math.random()*360,
        rotSpeed: (Math.random()-0.5)*10,
        life: 0
      });
    }
    if(confettiRAF) cancelAnimationFrame(confettiRAF);
    animateConfetti();
  }

  function animateConfetti(){
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rotation += p.rotSpeed;
      p.life++;
      if(p.y < confettiCanvas.height + 20) alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    });
    if(alive){
      confettiRAF = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    }
  }


  modeSelectEl.addEventListener('change', () => {
    modeSelect = modeSelectEl.value;
    labelOEl.textContent = modeSelect === 'cpu' ? 'Computador' : 'Jogador O';
    resetMatch();
  });

  formatSelectEl.addEventListener('change', () => {
    formatSelect = formatSelectEl.value;
    resetMatch();
  });

  restartBtn.addEventListener('click', resetMatch);


  updateScoreboard();
  updateRoundDisplay();
  setStatus(currentTurnLabel());
})();