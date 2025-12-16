const cardsRoot = document.getElementById('cards');
const shuffleBtn = document.getElementById('shuffleBtn');
const historyOl = document.getElementById('history');

let cards = [];
let isRunning = false;

function createBoard(){
  cardsRoot.innerHTML = '';
  cards = [];

  tasks.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.task = t;
    card.dataset.idx = i;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face front">${i+1}</div>
        <div class="card-face back">${t}</div>
      </div>
    `;

    cards.push(card);
    cardsRoot.appendChild(card);

    card.addEventListener('click', async ()=>{
      if(isRunning) return;
      await showTaskModal(card);
    });
  });
}

createBoard();

function randRange(min, max){ return Math.random()*(max-min)+min; }

function setShuffleVars(card){
  const tx = `${Math.round(randRange(-200,200))}px`;
  const ty = `${Math.round(randRange(-120,120))}px`;
  const rot = `${Math.round(randRange(-25,25))}deg`;
  const scale = randRange(0.9,1.05);
  const delay = `${Math.round(randRange(0,120))}ms`;

  card.style.setProperty('--tx', tx);
  card.style.setProperty('--ty', ty);
  card.style.setProperty('--rot', rot);
  card.style.setProperty('--scale', scale);
  card.style.setProperty('--delay', delay);
  card.style.setProperty('--dur','900ms');
}

function cssShufflePhase(){
  return new Promise(resolve => {
    cards.forEach(c=>setShuffleVars(c));
    void cardsRoot.offsetWidth;
    cards.forEach(c=>c.classList.add('shuffle-phase'));
    setTimeout(()=>{
      cards.forEach(c=>c.classList.remove('shuffle-phase'));
      resolve();
    }, 950);
  });
}

function doRealShuffle(){
  return new Promise(resolve => {
    const firstRects = cards.map(c => c.getBoundingClientRect());
    cards.sort(()=>Math.random()-0.5);
    cards.forEach(c=>cardsRoot.appendChild(c));
    const lastRects = cards.map(c => c.getBoundingClientRect());

    cards.forEach((card,i)=>{
      const dx = firstRects[i].left - lastRects[i].left;
      const dy = firstRects[i].top - lastRects[i].top;
      card.style.transition='transform 0s';
      card.style.transform=`translate(${dx}px,${dy}px)`;
      void card.offsetWidth;
      requestAnimationFrame(()=>{
        card.style.transition='transform 650ms cubic-bezier(.22,1,.36,1)';
        card.style.transform='';
      });
    });

    setTimeout(()=>{
      cards.forEach(c=>{
        c.style.transition='';
        c.style.transform='';
      });
      resolve();
    },700);
  });
}

function showTaskModal(card){
  return new Promise(resolve=>{
    const overlay=document.createElement('div');
    overlay.className='overlay';
    const modal=document.createElement('div');
    modal.className='modal';
    modal.innerHTML=`
      <div class="task">${card.dataset.task}</div>
      <div class="row">
        <button class="btn-confirm" id="confirmBtn">Удалить и закрыть</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    card.classList.add('highlight');

    document.getElementById('confirmBtn').onclick=()=>{
      const li=document.createElement('li');
      li.textContent=`${historyOl.children.length+1}. ${card.dataset.task}`;
      historyOl.prepend(li);
      const idx=cards.indexOf(card);
      if(idx!==-1) cards.splice(idx,1);
      card.remove();
      overlay.remove();
      resolve(true);
    };

    overlay.addEventListener('click', e=>{
      if(e.target===overlay){ overlay.remove(); resolve(false); }
    });

    overlay.addEventListener('transitionend',()=>{
      card.classList.remove('highlight');
    });
  });
}

shuffleBtn.addEventListener('click', async ()=>{
  if(isRunning) return;
  if(cards.length===0){ alert('Карт больше нет — все задания использованы.'); return; }
  isRunning=true;
  shuffleBtn.disabled=true;

  await cssShufflePhase();
  await cssShufflePhase();
  await cssShufflePhase();
  await doRealShuffle();

  const winnerIndex=Math.floor(Math.random()*cards.length);
  const winnerCard=cards[winnerIndex];
  await showTaskModal(winnerCard);

  shuffleBtn.disabled=false;
  isRunning=false;
});








