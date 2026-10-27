(() => {
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const serviceCards = [...document.querySelectorAll(".service-card[data-category]")];
  const status = document.getElementById("filter-status");

  if (!filterButtons.length || !serviceCards.length) return;

  const serviceWord = (count) => {
    const lastTwo = count % 100;
    const last = count % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return "послуг";
    if (last === 1) return "послугу";
    if (last >= 2 && last <= 4) return "послуги";
    return "послуг";
  };

  const setFilter = (filter) => {
    let visibleCount = 0;

    serviceCards.forEach((card) => {
      const visible = filter === "all" || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (status) {
      status.textContent = `Показано ${visibleCount} ${serviceWord(visibleCount)}`;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });
})();
