const cardsContainer = document.getElementById("cards");
const history = document.getElementById("history");
const shuffleBtn = document.getElementById("shuffleBtn");
const scrollBtn = document.getElementById("scrollBtn");

let available = [...Array(tasks.length).keys()];

// создаём карточки
tasks.forEach((task, i) => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face front">${i + 1}</div>
      <div class="card-face back">${task}</div>
    </div>
  `;
  cardsContainer.appendChild(card);
});

shuffleBtn.onclick = () => {
  if (!available.length) return alert("Задания закончились");

  const cards = Array.from(document.querySelectorAll(".card"));

  // фиксируем позиции
  const positions = cards.map(card => card.getBoundingClientRect());

  cards.forEach((card, i) => {
    const rect = positions[i];
    card.style.position = "absolute";
    card.style.left = rect.left + "px";
    card.style.top = rect.top + "px";
    card.style.width = rect.width + "px";
    card.style.height = rect.height + "px";
  });

  // очищаем контейнер
  cardsContainer.innerHTML = "";

  // перемешиваем массив
  cards.sort(() => Math.random() - 0.5);

  // добавляем обратно
  cards.forEach(card => cardsContainer.appendChild(card));

  // анимация возврата
  requestAnimationFrame(() => {
    cards.forEach(card => {
      card.style.transition = "all 1s cubic-bezier(.22,1,.36,1)";
      card.style.position = "";
      card.style.left = "";
      card.style.top = "";
      card.style.width = "";
      card.style.height = "";
    });
  });

  // выбор победителя
  const index = available.splice(
    Math.floor(Math.random() * available.length), 1
  )[0];

  setTimeout(() => {
    const winner = cards[index];
    winner.classList.add("flip");

    const li = document.createElement("li");
    li.textContent = `${history.children.length + 1}. ${tasks[index]}`;
    history.appendChild(li);
  }, 1100);
};

// прокрутка вниз
scrollBtn.onclick = () => {
  history.scrollIntoView({ behavior: "smooth" });
};


