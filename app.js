import { COUNTRIES } from "./countries.js";
import { findCountries, generateNames } from "./names.js";
import { parseSecretInput, generateTotp, remaining } from "./totp.js";

const $ = (id) => document.getElementById(id);

const country = $("country");
const search = $("countrySearch");

function flag(alpha2) {
  return [...alpha2]
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

function fillCountries(list) {
  country.innerHTML = "";

  list.forEach((c) => {
    const option = document.createElement("option");

    option.value = c.alpha2;
    option.textContent = `${flag(c.alpha2)}  ${c.name}`;

    country.appendChild(option);
  });
}

fillCountries(COUNTRIES);

search.addEventListener("input", () => {
  fillCountries(findCountries(search.value));
});

$("generateBtn").addEventListener("click", () => {
  const selected =
    COUNTRIES.find((c) => c.alpha2 === country.value) || COUNTRIES[0];

  const quantity = Math.max(
    1,
    Math.min(20, Number($("quantity").value) || 1)
  );

  const gender = $("gender").value;

  const names = generateNames(selected, gender, quantity);

  const list = $("namesList");
  list.innerHTML = "";

  names.forEach((name) => {
    const card = document.createElement("div");
    card.className = "name-card";

    const text = document.createElement("span");
    text.className = "copy-name";
    text.textContent = name;

    text.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(name);
      } catch {
        const temp = document.createElement("textarea");
        temp.value = name;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
    });

    card.appendChild(text);
    list.appendChild(card);
  });
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((tab) => tab.classList.remove("active"));

    button.classList.add("active");

    const namesMode = button.dataset.mode === "names";

    $("namesPanel").classList.toggle("hidden", !namesMode);
    $("totpPanel").classList.toggle("hidden", namesMode);
  });
});

function updateThemeButton() {
  const dark = document.body.classList.contains("dark");

  $("themeBtn").textContent = dark ? "🌙 Dark" : "☀ Light";
}

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  localStorage.setItem(
    "novagen-theme",
    dark ? "dark" : "light"
  );

  updateThemeButton();
});

if (localStorage.getItem("novagen-theme") === "dark") {
  document.body.classList.add("dark");
}

updateThemeButton();

$("menuBtn").addEventListener("click", () => {
  $("menu").classList.toggle("hidden");
});

$("featuresBtn").addEventListener("click", () => {
  $("menu").classList.add("hidden");
  $("dialog").showModal();
});

$("closeBtn").addEventListener("click", () => {
  $("dialog").close();
});

const quotes = [
  "Keep building, one clean step at a time.",
  "ছোট ছোট উন্নতিই বড় পরিবর্তন আনে।",
  "Clarity makes good tools feel effortless.",
  "নিজের গতিতে এগিয়ে যাও।",
  "Build useful things. Keep them simple."
];

function showQuote() {
  const element = $("quote");

  element.classList.add("fade");

  setTimeout(() => {
    element.textContent =
      quotes[Math.floor(Math.random() * quotes.length)];

    element.classList.remove("fade");
  }, 450);
}

showQuote();
setInterval(showQuote, 10000);

async function updateTotp() {
  const input = $("secret").value.trim();

  if (!input) {
    $("code").textContent = "••••••";
    $("timer").textContent = "Enter a secret";
    $("error").textContent = "";
    return;
  }

  try {
    const parsed = parseSecretInput(input);

    const algorithm =
      $("algorithm").value || parsed.algorithm || "SHA1";

    const digits =
      Number($("digits").value) || parsed.digits || 6;

    const period =
      Math.max(
        1,
        Number($("period").value) || parsed.period || 30
      );

    const code = await generateTotp(
      parsed.secret,
      Date.now(),
      algorithm,
      digits,
      period
    );

    $("code").textContent = code;

    $("timer").textContent =
      `Refreshes in ${remaining(Date.now(), period)}s`;

    $("error").textContent = "";
  } catch {
    $("code").textContent = "••••••";
    $("timer").textContent = "";
    $("error").textContent = "Invalid TOTP input";
  }
}

$("secret").addEventListener("input", updateTotp);

["algorithm", "digits", "period"].forEach((id) => {
  $(id).addEventListener("change", updateTotp);
});

$("code").addEventListener("click", async () => {
  const code = $("code").textContent;

  if (!/^\d+$/.test(code)) {
    return;
  }

  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = code;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
});

setInterval(updateTotp, 1000);

updateTotp();
