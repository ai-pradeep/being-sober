import "./style.css";
// Hardcoded reference date - Change this to any date you want
const referenceDate = new Date("October 6, 2025 00:00:00");

// DOM elements
const yearsElement = document.querySelector(
  ".time-unit:nth-child(1) .time-value"
);
const daysElement = document.querySelector(
  ".time-unit:nth-child(2) .time-value"
);
const hoursElement = document.querySelector(
  ".time-unit:nth-child(3) .time-value"
);
const minutesElement = document.querySelector(
  ".time-unit:nth-child(4) .time-value"
);
const secondsElement = document.querySelector(
  ".time-unit:nth-child(5) .time-value"
);

const yearsProgress = document.querySelector(".years-progress");
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

// Function to calculate years between two dates
function getYearsBetween(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  // Calculate the difference in years
  let years = endYear - startYear;

  // Check if the end date has passed the anniversary in the current year
  const anniversaryThisYear = new Date(
    endYear,
    startDate.getMonth(),
    startDate.getDate()
  );
  if (endDate < anniversaryThisYear) {
    years--;
  }

  return years;
}

// Function to calculate days in current year
function getDaysInCurrentYear(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  // If we're in the same year, just calculate the difference
  if (startYear === endYear) {
    const timeDiff = endDate - startDate;
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }

  // Calculate days since last anniversary
  const lastAnniversary = new Date(
    endYear,
    startDate.getMonth(),
    startDate.getDate()
  );
  if (endDate < lastAnniversary) {
    // If we haven't reached the anniversary this year, use last year's anniversary
    lastAnniversary.setFullYear(endYear - 1);
  }

  const timeDiff = endDate - lastAnniversary;
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

// Function to update the time display
function updateTimeSince() {
  const now = new Date();
  const timeDifference = now - referenceDate;

  // Calculate time units
  const totalSeconds = Math.floor(timeDifference / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  // Calculate years
  const years = getYearsBetween(referenceDate, now);

  // Calculate remaining time after extracting larger units
  const days = getDaysInCurrentYear(referenceDate, now);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  // Update the display
  yearsElement.textContent = years.toString().padStart(2, "0");
  daysElement.textContent = days.toString().padStart(2, "0");
  hoursElement.textContent = hours.toString().padStart(2, "0");
  minutesElement.textContent = minutes.toString().padStart(2, "0");
  secondsElement.textContent = seconds.toString().padStart(2, "0");

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

  // Days progress (based on current day progress)
  const daysProgressPercent = (days / 365) * 100;
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

  // Add pulse animation to seconds
  secondsElement.classList.add("pulse");
  setTimeout(() => {
    secondsElement.classList.remove("pulse");
  }, 500);
}

// Initial update
updateTimeSince();

// Update every second
setInterval(updateTimeSince, 1000);
