import "./style.css";
// Hardcoded reference date - Change this to any date you want
const referenceDate = new Date("February 13, 2026 00:00:00");

// Wires up a single flip-clock digit: call .set("7") to flip to a new
// value, no-ops if the value hasn't changed or a flip is already mid-motion
function createFlipDigit(digitEl) {
  const inner = digitEl.querySelector(".flip-digit__inner");
  const front = digitEl.querySelector(".flip-digit__face--front");
  const back = digitEl.querySelector(".flip-digit__face--back");
  let current = front.textContent;

  function set(value) {
    if (value === current || inner.classList.contains("is-flipping")) return;
    back.textContent = value;

    const onAnimationEnd = () => {
      inner.removeEventListener("animationend", onAnimationEnd);
      front.textContent = value;
      inner.classList.remove("is-flipping");
      current = value;
    };
    inner.addEventListener("animationend", onAnimationEnd);
    inner.classList.add("is-flipping");
  }

  return { set };
}

// Wires up a two-digit dial (tens + ones), each digit flipping
// independently only when its own value changes
function createFlipUnit(unitName) {
  const root = document.querySelector(`[data-flip="${unitName}"]`);
  const tens = createFlipDigit(root.querySelector('[data-place="tens"]'));
  const ones = createFlipDigit(root.querySelector('[data-place="ones"]'));

  return {
    set(value) {
      tens.set(value[0]);
      ones.set(value[1]);
    },
  };
}

const yearsFlip = createFlipUnit("years");
const monthsFlip = createFlipUnit("months");
const daysFlip = createFlipUnit("days");
const hoursFlip = createFlipUnit("hours");
const minutesFlip = createFlipUnit("minutes");
const secondsFlip = createFlipUnit("seconds");

const yearsProgress = document.querySelector(".years-progress");
const monthsProgress = document.querySelector(".months-progress");
const daysProgress = document.querySelector(".days-progress");
const hoursProgress = document.querySelector(".hours-progress");
const minutesProgress = document.querySelector(".minutes-progress");
const secondsProgress = document.querySelector(".seconds-progress");

const referenceDateElement = document.getElementById("referenceDate");

// Format the reference date for display
referenceDateElement.textContent =
  referenceDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }) +
  " at " +
  referenceDate.toLocaleTimeString("en-US");

// Add `years` years to a date, clamping the day if the target month is shorter
function addYears(date, years) {
  const d = new Date(date.getTime());
  const targetYear = d.getFullYear() + years;
  const month = d.getMonth();
  const day = d.getDate();
  d.setFullYear(targetYear, month, 1);
  const daysInTargetMonth = new Date(d.getFullYear(), month + 1, 0).getDate();
  d.setDate(Math.min(day, daysInTargetMonth));
  return d;
}

// Add `months` months to a date, clamping the day if the target month is shorter
function addMonths(date, months) {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const daysInTargetMonth = new Date(
    d.getFullYear(),
    d.getMonth() + 1,
    0
  ).getDate();
  d.setDate(Math.min(day, daysInTargetMonth));
  return d;
}

// Break the elapsed time between startDate and endDate into whole years and
// whole months, returning the anchor date marking that many years+months
function getYearsMonthsAnchor(startDate, endDate) {
  let years = endDate.getFullYear() - startDate.getFullYear();
  let anchor = addYears(startDate, years);
  if (anchor > endDate) {
    years--;
    anchor = addYears(startDate, years);
  }

  let months =
    (endDate.getFullYear() - anchor.getFullYear()) * 12 +
    (endDate.getMonth() - anchor.getMonth());
  let monthAnchor = addMonths(anchor, months);
  if (monthAnchor > endDate) {
    months--;
    monthAnchor = addMonths(anchor, months);
  }

  return { years, months, anchor: monthAnchor };
}

// Function to update the time display
function updateTimeSince() {
  const now = new Date();

  const { years, months, anchor } = getYearsMonthsAnchor(referenceDate, now);

  // Everything below month granularity is just a plain ms difference
  const remainingMs = now - anchor;
  const totalMinutes = Math.floor(remainingMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((remainingMs / 1000) % 60);

  // Update the display
  yearsFlip.set(years.toString().padStart(2, "0"));
  monthsFlip.set(months.toString().padStart(2, "0"));
  daysFlip.set(days.toString().padStart(2, "0"));
  hoursFlip.set(hours.toString().padStart(2, "0"));
  minutesFlip.set(minutes.toString().padStart(2, "0"));
  secondsFlip.set(seconds.toString().padStart(2, "0"));

  // Update circular progress indicators
  // Years progress (based on current year progress)
  const currentYear = now.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const daysInYear = Math.floor(
    (endOfYear - startOfYear) / (1000 * 60 * 60 * 24)
  );
  const yearsProgressPercent = (dayOfYear / daysInYear) * 100;
  yearsProgress.style.setProperty(
    "--years-progress",
    `${yearsProgressPercent}%`
  );

  // Months progress (based on how far through the 12-month cycle)
  const monthsProgressPercent = (months / 12) * 100;
  monthsProgress.style.setProperty(
    "--months-progress",
    `${monthsProgressPercent}%`
  );

  // Days progress (based on how far through the current month cycle)
  const daysInCurrentCycle = Math.round(
    (addMonths(anchor, 1) - anchor) / (1000 * 60 * 60 * 24)
  );
  const daysProgressPercent = (days / daysInCurrentCycle) * 100;
  daysProgress.style.setProperty("--days-progress", `${daysProgressPercent}%`);

  // Hours progress (based on current hour of the day)
  const hoursProgressPercent = (hours / 24) * 100;
  hoursProgress.style.setProperty(
    "--hours-progress",
    `${hoursProgressPercent}%`
  );

  // Minutes progress (based on current minute of the hour)
  const minutesProgressPercent = (minutes / 60) * 100;
  minutesProgress.style.setProperty(
    "--minutes-progress",
    `${minutesProgressPercent}%`
  );

  // Seconds progress (based on current second of the minute)
  const secondsProgressPercent = (seconds / 60) * 100;
  secondsProgress.style.setProperty(
    "--seconds-progress",
    `${secondsProgressPercent}%`
  );
}

// Initial update
updateTimeSince();

// Update every second
setInterval(updateTimeSince, 1000);
