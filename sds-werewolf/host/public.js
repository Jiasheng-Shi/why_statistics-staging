const STORAGE_KEY = "sds-werewolf-public-v1";
const HOST_STORAGE_KEY = "sds-werewolf-host-v1";
sessionStorage.removeItem(HOST_STORAGE_KEY);
const root = document.querySelector("#standalone-public");

function formatNumber(value) {
  return Number(value).toFixed(1);
}

function isValidPayload(payload) {
  return Boolean(
    payload &&
    Number.isInteger(payload.roundNo) &&
    Number.isInteger(payload.teamSize) &&
    Array.isArray(payload.values) &&
    payload.values.length === payload.teamSize &&
    payload.values.every(Number.isFinite) &&
    ["SUCCESS", "FAIL"].includes(payload.result) &&
    Number.isInteger(payload.successes) &&
    Number.isInteger(payload.failures)
  );
}

function renderPublic(payload) {
  if (!isValidPayload(payload)) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  document.querySelector("#public-round-label").textContent = `第${payload.roundNo}轮 · ${payload.teamSize}人车`;
  document.querySelector("#public-kicker").textContent = "匿名车队数据 · 从小到大";
  document.querySelector("#public-values").innerHTML = payload.values
    .map((value) => `<span class="public-value">${formatNumber(value)}</span>`)
    .join("");

  const result = document.querySelector("#public-result");
  result.className = `public-result ${payload.result === "SUCCESS" ? "success" : "fail"}`;
  result.textContent = `${payload.result} · ${payload.resultCn}`;
  document.querySelector("#public-score").textContent = `任务比分　Signal ${payload.successes} : ${payload.failures} Noise`;
}

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== "SDS_PUBLIC_RESULT") return;
  renderPublic(event.data.payload);
});

document.querySelector("#public-fullscreen").addEventListener("click", async () => {
  if (!document.fullscreenElement) await root.requestFullscreen();
});

try {
  const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  if (saved) renderPublic(saved);
} catch {
  sessionStorage.removeItem(STORAGE_KEY);
}

if (window.opener) {
  window.opener.postMessage({ type: "SDS_PUBLIC_READY" }, window.location.origin);
}
