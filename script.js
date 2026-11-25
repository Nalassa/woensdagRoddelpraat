
(() => {
  // ==========================================
  // COUNTDOWN: Every Wednesday at 18:00
  // ==========================================

  const fields = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };

  function nextWednesday18(now) {
    const target = new Date(now);
    const daysUntilWednesday = (3 - now.getDay() + 7) % 7;

    target.setDate(now.getDate() + daysUntilWednesday);
    target.setHours(18, 0, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 7);
    }

    return target;
  }

  function updateCountdown() {
    const now = new Date();
    const target = nextWednesday18(now);
    const remaining = Math.max(0, target - now);

    const totalSeconds = Math.floor(remaining / 1000);

    fields.days.textContent =
      String(Math.floor(totalSeconds / 86400)).padStart(2, "0");

    fields.hours.textContent =
      String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");

    fields.minutes.textContent =
      String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");

    fields.seconds.textContent =
      String(totalSeconds % 60).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  // ==========================================
  // YOUTUBE UPLOAD DETECTION
  // ==========================================

  const dot = document.getElementById("upload-status-dot");

  const CHANNEL_ID = "UCNSlMHXTIYWUFaJSUPyidLQ";

  const RSS_URL =
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  const GREEN_DURATION = 36 * 60 * 60 * 1000; // 36 hours

  const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  function setStatus(isNew, message) {
    if (!dot) return;

    dot.classList.toggle("is-new", isNew);
    dot.title = message;
    dot.setAttribute("aria-label", message);
  }

  async function checkLatestUpload() {
    // Default to RED until a real upload is confirmed.
    setStatus(false, "Wachten op nieuwe aflevering");

    try {
      const apiUrl =
        "https://api.rss2json.com/v1/api.json?rss_url=" +
        encodeURIComponent(RSS_URL);

      const response = await fetch(apiUrl, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("RSS request failed");
      }

      const data = await response.json();

      if (data.status !== "ok" || !data.items?.length) {
        throw new Error("No YouTube uploads found");
      }

      // Find the newest actual upload.
      const latestUpload = data.items
        .map(item => new Date(item.pubDate).getTime())
        .filter(timestamp => Number.isFinite(timestamp))
        .sort((a, b) => b - a)[0];

      if (!latestUpload) {
        throw new Error("Invalid upload date");
      }

      const age = Date.now() - latestUpload;

      // Green ONLY during the first 36 hours after upload.
      if (age >= 0 && age < GREEN_DURATION) {
        const hoursLeft = Math.ceil(
          (GREEN_DURATION - age) / (60 * 60 * 1000)
        );

        setStatus(
          true,
          `Nieuwe aflevering online! Nog ${hoursLeft} uur groen.`
        );
      } else {
        setStatus(
          false,
          "Wachten op nieuwe aflevering"
        );
      }

    } catch (error) {
      console.warn("YouTube upload check failed:", error);

      // Never show green when upload status is unknown.
      setStatus(false, "YouTube uploadstatus niet beschikbaar");
    }
  }

  // Check immediately when website loads.
  checkLatestUpload();

  // Check again every 5 minutes.
  setInterval(checkLatestUpload, CHECK_INTERVAL);

})();
