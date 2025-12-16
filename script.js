// script.js — рабочий вариант с длинной анимацией

const cardsRoot = document.getElementById('cards');
const shuffleBtn = document.getElementById('shuffleBtn');
const historyOl = document.getElementById('history');

let cards = [];
let isRunning = false;

// Создаём карточки из массива tasks
function createBoard(){
  cardsRoot.innerHTML = '';
  cards = [];

  tasks.forEach((task, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.task = task;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-face front';
    front.textContent = idx + 1;

    const back = document.createElement('div');
    back.className = 'card-face back';
    back.textContent = task;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    cardsRoot.appendChild(card);
    cards.push(card);
  });
}

// Устанавливаем случайное смещение и поворот для shuffle
function setShuffleVars(card){
  const tx = (Math.random() - 0.5) * 200;
  const ty = (Math.random() - 0.5) * 200;
  const rot = (Math.random() - 0.5) * 60;
  card.style.setProperty('--tx', tx + 'px');
  card.style.setProperty('--ty', ty + 'px');
  card.style.setProperty('--rot', rot + 'deg');
}

// Фаза анимации shuffle
function cssShufflePhase(){
  return new Promise(resolve => {
    cards.forEach(c => {
      setShuffleVars(c);
      c.style.setProperty('--dur','1800ms'); // длиннее анимация
    });

    void cardsRoot.offsetWidth; // триггер перерисовки
    cards.forEach(c => c.classList.add('shuffle-phase'));

    setTimeout(() => {
      cards.forEach(c => c.classList.remove('shuffle-phase'));
      resolve();
    }, 1900);
  });
}

// Перемешиваем массив карт и обновляем порядок в DOM
function doRealShuffle(){
  return new Promise(resolve => {
    for(let i = cards.length-1; i > 0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    cards.forEach(c => cardsRoot.appendChild(c));
    resolve();
  });
}

// Показываем модалку с выбранной карточкой
function showTaskModal(card){
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="task">${card.dataset.task}</div>
      <div class="row">
        <button class="btn-confirm" id="confirmBtn">Удалить и закрыть</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const confirmBtn = modal.querySelector('#confirmBtn');
    confirmBtn.onclick = () => {
      const li = document.createElement('li');
      li.textContent = `${historyOl.children.length + 1}. ${card.dataset.task}`;
      historyOl.prepend(li);

      const idx = cards.indexOf(card);
      if(idx !== -1) cards.splice(idx, 1);
      card.remove();

      overlay.remove();
      resolve(true);
    };

    overlay.addEventListener('click', e => {
      if(e.target === overlay){
        overlay.remove();
        resolve(false);
      }
    });
  });
}

// Кнопка shuffle
shuffleBtn.addEventListener('click', async () => {
  if(isRunning) return;
  if(cards.length === 0){
    alert('Карт больше нет — все задания использованы.');
    return;
  }

  isRunning = true;
  shuffleBtn.disabled = true;

  await cssShufflePhase();
  await cssShufflePhase();
  await cssShufflePhase();

  await doRealShuffle();

  const winnerIndex = Math.floor(Math.random() * cards.length);
  const winnerCard = cards[winnerIndex];

  await showTaskModal(winnerCard);

  shuffleBtn.disabled = false;
  isRunning = false;
});

// Инициализация доски
createBoard();





