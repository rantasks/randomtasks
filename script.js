// script.js
const cardsRoot = document.getElementById('cards');
const shuffleBtn = document.getElementById('shuffleBtn');
const historyOl = document.getElementById('history');

let cards = [];
let isRunning = false;
let slots = []; // позиции ячеек

function createBoard(){
  cardsRoot.innerHTML = '';
  cards = [];
  slots = [];

  const rect = cardsRoot.getBoundingClientRect();
  const gap = 20;

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

    // сохраняем слоты
    const colWidth = (rect.width - gap * (tasks.length-1)) / tasks.length;
    slots.push({
      left: i * (colWidth + gap),
      top: 0
    });

    card.style.position = 'absolute';
    card.style.left = `${slots[i].left}px`;
    card.style.top = `${slots[i].top}px`;

    card.addEventListener('click', async ()=>{
      if(isRunning) return;
      await showTaskModal(card);
    });
  });
}

createBoard();

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function animateCard(card, path, duration){
  return new Promise(resolve=>{
    let start = null;
    const startPos = {left: parseFloat(card.style.left), top: parseFloat(card.style.top)};
    const delta = path.map(p => ({x: p.left - startPos.left, y: p.top - startPos.top}));

    function step(ts){
      if(!start) start = ts;
      const t = (ts-start)/duration;
      if(t >= 1){
        card.style.left = `${path[path.length-1].left}px`;
        card.style.top = `${path[path.length-1].top}px`;
        resolve();
        return;
      }

      // вычисляем промежуточную точку через все точки path
      let seg = Math.floor(t*delta.length);
      if(seg >= delta.length) seg = delta.length-1;
      const segT = t*delta.length - seg;
      const x = startPos.left + delta.slice(0,seg).reduce((a,b)=>a+b.x,0) + delta[seg].x*segT;
      const y = startPos.top + delta.slice(0,seg).reduce((a,b)=>a+b.y,0) + delta[seg].y*segT;
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

async function shuffleCards(){
  if(isRunning) return;
  isRunning = true;
  shuffleBtn.disabled = true;

  if(cards.length===0){ alert('Нет карт'); isRunning=false; shuffleBtn.disabled=false; return; }

  // генерируем новый порядок случайно
  const order = [...Array(cards.length).keys()];
  for(let i=order.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  // создаём пути для каждой карты через промежуточные точки
  const maxOffset = 60;
  const duration = 1000;
  const animations = [];

  cards.forEach((card,i)=>{
    const targetSlot = slots[order[i]];
    const mid1 = {left: parseFloat(card.style.left), top: parseFloat(card.style.top) - randRange(20,maxOffset)};
    const mid2 = {left: targetSlot.left, top: targetSlot.top - randRange(20,maxOffset)};
    animations.push(animateCard(card,[mid1,mid2,targetSlot],duration));
  });

  await Promise.all(animations);

  // обновляем порядок массива карт по слоту
  cards.sort((a,b)=>order[a.dataset.idx]-order[b.dataset.idx]);

  // выбираем победителя
  const winnerIndex = Math.floor(Math.random()*cards.length);
  const winnerCard = cards[winnerIndex];
  winnerCard.classList.add('highlight-long');
  await showTaskModal(winnerCard);

  shuffleBtn.disabled = false;
  isRunning=false;
}

shuffleBtn.addEventListener('click', shuffleCards);

function randRange(min,max){ return Math.random()*(max-min)+min; }

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
  });
}









