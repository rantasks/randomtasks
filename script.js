const cardsContainer = document.getElementById("cards");
const shuffleBtn = document.getElementById("shuffleBtn");
const history = document.getElementById("history");
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

  // FIRST — запоминаем позиции
  const first = cards.map(card => card.getBoundingClientRect());

  // реально перемешиваем порядок
  cards.sort(() => Math.random() - 0.5);
  cards.forEach(card => cardsContainer.appendChild(card));

  // LAST — новые позиции
  const last = cards.map(card => card.getBoundingClientRect());

  // INVERT + PLAY
  cards.forEach((card, i) => {
    const dx = first[i].left - last[i].left;
    const dy = first[i].top - last[i].top;

    card.style.transform = `translate(${dx}px, ${dy}px)`;
    card.style.transition = "transform 0s";

    requestAnimationFrame(() => {
      card.style.transition = "transform 700ms cubic-bezier(.22,1,.36,1)";
      card.style.transform = "";
    });
  });

  // выбор победителя
  const index = available.splice(
    Math.floor(Math.random() * available.length), 1
  )[0];

  setTimeout(() => {
    const winner = document.querySelectorAll(".card")[index];
    winner.classList.add("flip");

    const li = document.createElement("li");
    li.textContent = `${history.children.length + 1}. ${tasks[index]}`;
    history.appendChild(li);
  }, 800);
};

// прокрутка вниз
scrollBtn.onclick = () => {
  history.scrollIntoView({ behavior: "smooth" });
};



