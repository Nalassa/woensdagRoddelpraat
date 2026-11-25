(() => {
  const fields = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };
  const label = document.getElementById("episode-label");

  function nextWednesday18(now) {
    const target = new Date(now);
    const daysUntilWednesday = (3 - now.getDay() + 7) % 7;
    target.setDate(now.getDate() + daysUntilWednesday);
    target.setHours(18, 0, 0, 0);
    // If it is Wednesday at or after 18:00, count down to next week.
    if (target <= now) target.setDate(target.getDate() + 7);
    return target;
  }

  function tick() {
    const now = new Date();
    const target = nextWednesday18(now);
    const remaining = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);

    fields.days.textContent = String(Math.floor(totalSeconds / 86400)).padStart(2, "0");
    fields.hours.textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
    fields.minutes.textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    fields.seconds.textContent = String(totalSeconds % 60).padStart(2, "0");

    const isWednesday = now.getDay() === 3;
    const afterSix = now.getHours() >= 18;
    label.textContent = isWednesday && !afterSix ? "VANAVOND OM 18:00" : "NIEUWSTE AFLEVERING";
  }

  tick();
  setInterval(tick, 1000);
})();