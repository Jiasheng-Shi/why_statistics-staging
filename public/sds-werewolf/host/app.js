import { generateRound } from "./game-engine.js";

const ROUND_SIZES = [3, 3, 4, 4, 5];
const STORAGE_KEY = "sds-werewolf-host-v1";
const MODE_LABELS = {
  signal: "Signal",
  stealth: "潜伏 · μ=50",
  down: "向下 · μ=25",
  up: "向上 · μ=75"
};

const app = document.querySelector("#app");
const publicScreen = document.querySelector("#public-screen");
const privacyCover = document.querySelector("#privacy-cover");
const toast = document.querySelector("#toast");

const freshState = () => ({
  noisePlayers: [],
  setupSelection: [],
  currentRound: 0,
  history: [],
  draftRiders: [],
  draftModes: {},
  currentResult: null,
  endState: null,
  finalOutcome: null,
  redrawCount: 0
});

let state = loadState();
let publicWindow = null;
let toastTimer = null;

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...freshState(), ...JSON.parse(raw) } : freshState();
  } catch {
    return freshState();
  }
}

function saveState() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function score(includePending = false) {
  const results = state.history.map((round) => round.result);
  if (includePending && state.currentResult) results.push(state.currentResult.public.result);
  return {
    successes: results.filter((result) => result === "SUCCESS").length,
    failures: results.filter((result) => result === "FAIL").length
  };
}

function formatNumber(value) {
  return Number(value).toFixed(1);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function setHostHidden(hidden) {
  [document.querySelector(".topbar"), app, document.querySelector(".footer")].forEach((element) => {
    if (!element) return;
    element.inert = hidden;
    if (hidden) element.setAttribute("aria-hidden", "true");
    else element.removeAttribute("aria-hidden");
  });
}

function setLayerVisible(layer, visible) {
  layer.classList.toggle("visible", visible);
  layer.setAttribute("aria-hidden", String(!visible));
  layer.inert = !visible;
}

function showPrivacyCover() {
  setHostHidden(true);
  setLayerVisible(publicScreen, false);
  setLayerVisible(privacyCover, true);
}

async function leavePublicSafely() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  showPrivacyCover();
}

function render() {
  if (state.noisePlayers.length !== 2) {
    renderSetup();
  } else if (state.endState) {
    renderEnd();
  } else {
    renderRound();
  }
  saveState();
}

function renderSetup() {
  const seats = Array.from({ length: 8 }, (_, index) => index + 1)
    .map((player) => {
      const selected = state.setupSelection.includes(player);
      const unavailable = state.setupSelection.length >= 2 && !selected;
      return `
        <button
          class="seat-button setup-seat ${selected ? "selected" : ""}"
          type="button"
          data-player="${player}"
          aria-pressed="${selected}"
          ${unavailable ? "disabled" : ""}
        >
          ${player}<span>${selected ? "NOISE" : "玩家"}</span>
        </button>`;
    })
    .join("");

  app.innerHTML = `
    <section class="setup-layout">
      <div class="setup-copy">
        <p class="eyebrow">HOST CONSOLE · SDS CLASSROOM GAME</p>
        <h1>把随机数交给网页，<br />把推理留给玩家。</h1>
        <p>
          页面会完成每轮数据生成、匿名排序和任务判定。身份与私人数字只留在当前标签页；
          关闭标签页后自动清除。
        </p>
        <div class="formula-strip">Signal N(50,10²) · Noise 50 / 25 / 75 · Z &gt; 1.5 → FAIL</div>
      </div>

      <div class="setup-panel panel">
        <div class="panel-heading">
          <div>
            <h2>锁定两名 Noise（狼人）</h2>
            <p>点击两个真实座位号。开始后默认隐藏身份。</p>
          </div>
          <span class="secret-badge">主持人私密</span>
        </div>
        <div class="seat-grid">${seats}</div>
        <p class="selection-count">已选择 <strong>${state.setupSelection.length}</strong> / 2</p>
        <button class="primary-button" id="start-game" type="button" ${state.setupSelection.length === 2 ? "" : "disabled"}>
          锁定身份并开始第1轮
        </button>
      </div>
    </section>`;
}

function missionTrack() {
  return ROUND_SIZES.map((size, index) => {
    const completed = state.history[index];
    const status = completed ? (completed.result === "SUCCESS" ? "success" : "fail") : "";
    const current = !state.endState && index === state.currentRound ? "current" : "";
    return `
      <div class="mission-step ${status} ${current}">
        <small>MISSION 0${index + 1}</small>
        <strong>${size} 人车 · ${completed ? completed.result : index === state.currentRound ? "当前轮" : "待进行"}</strong>
      </div>`;
  }).join("");
}

function sidePanel() {
  const currentScore = score();
  const history = state.history.length
    ? state.history.map((round) => `
        <li>
          <span>R${round.roundNo}</span>
          <em>${round.values.map(formatNumber).join(" / ")}</em>
          <b class="${round.result === "SUCCESS" ? "success" : "fail"}">${round.result}</b>
        </li>`).join("")
    : `<li><em>尚无已确认任务</em></li>`;

  return `
    <aside class="side-panel panel">
      <div class="side-section">
        <h3>当前比分</h3>
        <div class="score-row signal"><span>Signal · 成功</span><b>${currentScore.successes}</b></div>
        <div class="score-row noise"><span>Noise · 失败</span><b>${currentScore.failures}</b></div>
      </div>
      <div class="side-section">
        <h3>秘密身份</h3>
        <div class="identity-lock">
          <code id="identity-code">•• + ••</code>
          <button class="hold-reveal" id="hold-identity" type="button">按住查看</button>
        </div>
      </div>
      <div class="side-section">
        <h3>任务记录</h3>
        <ol class="history-list">${history}</ol>
      </div>
      <div class="side-section">
        <button class="danger-button" id="reset-game" type="button">重置整局</button>
      </div>
    </aside>`;
}

function riderButtons() {
  const required = ROUND_SIZES[state.currentRound];
  return Array.from({ length: 8 }, (_, index) => index + 1)
    .map((player) => {
      const selected = state.draftRiders.includes(player);
      const unavailable = state.draftRiders.length >= required && !selected;
      return `
        <button
          type="button"
          class="rider-button ${selected ? "selected" : ""}"
          data-rider="${player}"
          aria-pressed="${selected}"
          ${unavailable ? "disabled" : ""}
        >${player}</button>`;
    })
    .join("");
}

function noiseActionControls() {
  const onboardNoise = state.draftRiders.filter((player) => state.noisePlayers.includes(player));

  if (onboardNoise.length === 0) {
    return `<p class="pure-team">目前是纯 Signal 车：按规则本轮必定成功，但仍会生成并发放随机数字。</p>`;
  }

  return onboardNoise.map((player) => {
    const buttons = [
      ["stealth", "潜伏 · 50"],
      ["down", "向下 · 25"],
      ["up", "向上 · 75"]
    ].map(([mode, label]) => `
      <button
        type="button"
        class="mode-button ${state.draftModes[player] === mode ? "selected" : ""}"
        data-player="${player}"
        data-mode="${mode}"
        aria-pressed="${state.draftModes[player] === mode}"
      >${label}</button>`).join("");

    return `
      <div class="noise-action">
        <strong>${player}号 Noise</strong>
        <div class="mode-buttons">${buttons}</div>
      </div>`;
  }).join("");
}

function readyToGenerate() {
  const required = ROUND_SIZES[state.currentRound];
  if (state.draftRiders.length !== required) return false;
  const onboardNoise = state.draftRiders.filter((player) => state.noisePlayers.includes(player));
  return onboardNoise.every((player) => ["stealth", "down", "up"].includes(state.draftModes[player]));
}

function draftPanel() {
  const required = ROUND_SIZES[state.currentRound];
  const selected = state.draftRiders.length;
  const onboardNoise = state.draftRiders.filter((player) => state.noisePlayers.includes(player)).length;

  return `
    <div class="panel-heading">
      <div>
        <h2>组建本轮车队</h2>
        <p>表决若被否决，直接修改名单；只有生成数据后才锁定本轮。</p>
      </div>
      <span class="secret-badge">主持人私密</span>
    </div>

    <section class="team-section">
      <div class="section-label">
        <h3>选择 ${required} 名车员</h3>
        <span>已选择 ${selected} / ${required}</span>
      </div>
      <div class="rider-grid">${riderButtons()}</div>
    </section>

    <details class="secret-zone" ${selected === required ? "open" : ""}>
      <summary>配置上车 Noise 的秘密行动 <span>${onboardNoise} 名 Noise 上车</span></summary>
      ${noiseActionControls()}
    </details>

    <div class="generate-row">
      <button class="primary-button" id="generate-round" type="button" ${readyToGenerate() ? "" : "disabled"}>
        生成本轮数据
      </button>
      <p>生成后车队与行动将锁定；每个数字先保留一位小数，再用于任务判定。</p>
    </div>`;
}

function resultPanel() {
  const result = state.currentResult;
  const slipCards = result.slips.map(({ player, value }) => `
    <article class="slip-card">
      <span>${player}号玩家</span>
      <strong>${formatNumber(value)}</strong>
    </article>`).join("");

  const auditRows = result.host.records.map((record) => `
    <tr>
      <td>${record.player}号</td>
      <td>${record.role}</td>
      <td>${MODE_LABELS[record.mode]}</td>
      <td>${record.mean}</td>
      <td>${formatNumber(record.value)}</td>
    </tr>`).join("");

  return `
    <div class="panel-heading">
      <div>
        <h2>本轮数据已锁定</h2>
        <p>先把下方数字分别抄到纸条；玩家看完后收回纸条，再公开结果。</p>
      </div>
      <span class="secret-badge">禁止投屏</span>
    </div>

    <div class="result-banner ${result.public.failed ? "fail" : "success"}">
      <div>
        <p>HOST PREVIEW · 尚未公开</p>
        <h2>第${state.currentRound + 1}轮 · ${result.public.resultCn}</h2>
      </div>
      <span class="result-stamp">${result.public.result}</span>
    </div>

    <div class="section-label">
      <h3>私人数据条</h3>
      <span>只按座位号分别发放，不能让学生互看</span>
    </div>
    <div class="slip-grid">${slipCards}</div>

    <details class="host-details">
      <summary>主持人后台核对：身份、分布与 Z 值（严禁公开）</summary>
      <table class="audit-table">
        <thead><tr><th>玩家</th><th>身份</th><th>模式</th><th>均值</th><th>数字</th></tr></thead>
        <tbody>${auditRows}</tbody>
      </table>
      <p class="audit-note">
        Signal均值 ${formatNumber(result.host.signalMean)}；
        Noise均值 ${result.host.noiseMean === null ? "—" : formatNumber(result.host.noiseMean)}；
        Z = ${result.host.z.toFixed(3)}；临界值 1.5。
      </p>
    </details>

    <div class="result-actions">
      <button class="primary-button" id="open-public-window" type="button">打开独立投屏窗口</button>
      <button class="secondary-button" id="show-public-overlay" type="button">在本页公开展示</button>
      <button class="secondary-button" id="commit-round" type="button">确认计分并继续</button>
      <button class="danger-button" id="discard-round" type="button">输入有误，作废重抽</button>
    </div>`;
}

function renderRound() {
  const required = ROUND_SIZES[state.currentRound];
  app.innerHTML = `
    <section class="hero-line">
      <div>
        <p class="eyebrow">ROUND 0${state.currentRound + 1} · HOST CONSOLE</p>
        <h1>第${state.currentRound + 1}轮：${required}人车</h1>
      </div>
      <div class="round-meta"><strong>${state.history.length} / 5</strong>已确认任务</div>
    </section>
    <div class="mission-track">${missionTrack()}</div>
    <div class="workspace-grid">
      <section class="main-panel panel">
        ${state.currentResult ? resultPanel() : draftPanel()}
      </section>
      ${sidePanel()}
    </div>`;
}

function renderEnd() {
  const currentScore = score();
  let title = "Signal（好人）获胜";
  let eyebrow = "THREE SUCCESSFUL MISSIONS";
  let copy = "三次任务成功，游戏结束。干净的数据车队经受住了 Noise 的干扰。";

  if (state.endState === "audit" && !state.finalOutcome) {
    title = "进入最终审判";
    eyebrow = "THREE FAILED MISSIONS · ONE LAST CHANCE";
    copy = "三次任务失败并不直接判 Noise 获胜。完成正常复盘后，所有8人各自写下两名 Noise 嫌疑人。";
  } else if (state.finalOutcome === "signal") {
    title = "Signal 终审翻盘";
    eyebrow = "BOTH NOISE IDENTIFIED";
    copy = "最终审判准确选出两名 Noise，Signal（好人）阵营翻盘获胜。";
  } else if (state.finalOutcome === "noise") {
    title = "Noise（狼人）获胜";
    eyebrow = "NOISE SURVIVED THE AUDIT";
    copy = "最终审判未能同时选中两名 Noise，Noise（狼人）阵营获胜。";
  }

  const auditButtons = state.endState === "audit" && !state.finalOutcome
    ? `<div class="result-actions" style="justify-content:center">
        <button class="primary-button" id="audit-signal" type="button">终审选中双狼</button>
        <button class="danger-button" id="audit-noise" type="button">终审未选中双狼</button>
      </div>`
    : "";

  app.innerHTML = `
    <div class="mission-track">${missionTrack()}</div>
    <section class="end-card">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p>${copy}</p>
      <div class="end-score">
        <span>Signal成功<b>${currentScore.successes}</b></span>
        <span>Noise失败<b>${currentScore.failures}</b></span>
      </div>
      ${auditButtons}
      <div class="result-actions" style="justify-content:center">
        <button class="secondary-button" id="reset-game" type="button">开始新的一局</button>
      </div>
    </section>`;
}

function publicPayload() {
  if (!state.currentResult) return null;
  const currentScore = score(true);
  return {
    roundNo: state.currentRound + 1,
    teamSize: ROUND_SIZES[state.currentRound],
    values: [...state.currentResult.public.values],
    result: state.currentResult.public.result,
    resultCn: state.currentResult.public.resultCn,
    successes: currentScore.successes,
    failures: currentScore.failures
  };
}

function renderPublicOverlay() {
  const payload = publicPayload();
  if (!payload) return;
  document.querySelector("#public-round-label").textContent = `第${payload.roundNo}轮 · ${payload.teamSize}人车`;
  document.querySelector("#public-values").innerHTML = payload.values
    .map((value) => `<span class="public-value">${formatNumber(value)}</span>`)
    .join("");
  const result = document.querySelector("#public-result");
  result.className = `public-result ${payload.result === "SUCCESS" ? "success" : "fail"}`;
  result.textContent = `${payload.result} · ${payload.resultCn}`;
  document.querySelector("#public-score").textContent = `任务比分　Signal ${payload.successes} : ${payload.failures} Noise`;
  setHostHidden(true);
  setLayerVisible(privacyCover, false);
  setLayerVisible(publicScreen, true);
}

function sendToPublicWindow(target = publicWindow) {
  const payload = publicPayload();
  if (!target || target.closed || !payload) return;
  target.postMessage({ type: "SDS_PUBLIC_RESULT", payload }, window.location.origin);
}

function openPublicWindow() {
  publicWindow = window.open("./public.html", "sds-werewolf-public");
  if (!publicWindow) {
    showToast("浏览器拦截了新窗口，已改用本页公开展示。");
    renderPublicOverlay();
    return;
  }
  window.setTimeout(() => sendToPublicWindow(), 300);
  publicWindow.focus();
}

function resetGame() {
  const first = window.confirm("确定重置整局吗？当前身份、数据和任务记录都会清除。");
  if (!first) return;
  const second = window.confirm("请再次确认：清除后无法恢复。");
  if (!second) return;
  state = freshState();
  sessionStorage.removeItem(STORAGE_KEY);
  render();
}

app.addEventListener("click", (event) => {
  const setupSeat = event.target.closest("[data-player].setup-seat");
  if (setupSeat) {
    const player = Number(setupSeat.dataset.player);
    state.setupSelection = state.setupSelection.includes(player)
      ? state.setupSelection.filter((value) => value !== player)
      : [...state.setupSelection, player].sort((a, b) => a - b);
    render();
    return;
  }

  const riderButton = event.target.closest("[data-rider]");
  if (riderButton && !state.currentResult) {
    const player = Number(riderButton.dataset.rider);
    const required = ROUND_SIZES[state.currentRound];
    if (state.draftRiders.includes(player)) {
      state.draftRiders = state.draftRiders.filter((value) => value !== player);
      delete state.draftModes[player];
    } else if (state.draftRiders.length < required) {
      state.draftRiders = [...state.draftRiders, player].sort((a, b) => a - b);
    }
    render();
    return;
  }

  const modeButton = event.target.closest("[data-mode]");
  if (modeButton && !state.currentResult) {
    state.draftModes[modeButton.dataset.player] = modeButton.dataset.mode;
    render();
    return;
  }

  if (event.target.closest("#start-game")) {
    const seats = state.setupSelection.join("号、") + "号";
    if (!window.confirm(`确认 ${seats} 是本局两名 Noise（狼人）？`)) return;
    state.noisePlayers = [...state.setupSelection];
    state.setupSelection = [];
    render();
    return;
  }

  if (event.target.closest("#generate-round")) {
    try {
      const onboardNoise = state.draftRiders.filter((player) => state.noisePlayers.includes(player));
      const noiseModes = Object.fromEntries(onboardNoise.map((player) => [player, state.draftModes[player]]));
      state.currentResult = generateRound({
        riders: [...state.draftRiders],
        noisePlayers: [...state.noisePlayers],
        noiseModes
      });
      render();
      showToast("数据已生成并锁定。先抄写私人纸条，再打开公开屏。");
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.closest("#open-public-window")) {
    openPublicWindow();
    return;
  }

  if (event.target.closest("#show-public-overlay")) {
    renderPublicOverlay();
    return;
  }

  if (event.target.closest("#commit-round")) {
    const result = state.currentResult;
    state.history.push({
      roundNo: state.currentRound + 1,
      teamSize: ROUND_SIZES[state.currentRound],
      values: [...result.public.values],
      result: result.public.result
    });
    state.currentResult = null;
    state.draftRiders = [];
    state.draftModes = {};
    state.redrawCount = 0;

    const currentScore = score();
    if (currentScore.successes >= 3) {
      state.endState = "signal";
    } else if (currentScore.failures >= 3) {
      state.endState = "audit";
    } else {
      state.currentRound += 1;
    }
    render();
    return;
  }

  if (event.target.closest("#discard-round")) {
    if (!window.confirm("仅在输入车员或行动有误时作废。本轮真的要重新生成吗？")) return;
    state.currentResult = null;
    state.redrawCount += 1;
    render();
    showToast(`本轮已作废 ${state.redrawCount} 次；请核对输入后重新生成。`);
    return;
  }

  if (event.target.closest("#audit-signal")) {
    state.finalOutcome = "signal";
    render();
    return;
  }

  if (event.target.closest("#audit-noise")) {
    state.finalOutcome = "noise";
    render();
    return;
  }

  if (event.target.closest("#reset-game")) resetGame();
});

function concealIdentity() {
  const identityCode = document.querySelector("#identity-code");
  if (identityCode) identityCode.textContent = "•• + ••";
}

app.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("#hold-identity")) return;
  const identityCode = document.querySelector("#identity-code");
  if (identityCode) identityCode.textContent = state.noisePlayers.map((player) => `${player}号`).join(" + ");
});

window.addEventListener("pointerup", concealIdentity);
window.addEventListener("pointercancel", concealIdentity);
window.addEventListener("blur", concealIdentity);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) concealIdentity();
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== "SDS_PUBLIC_READY") return;
  sendToPublicWindow(event.source);
});

document.querySelector("#cover-screen").addEventListener("click", () => {
  showPrivacyCover();
});

document.querySelector("#close-cover").addEventListener("click", () => {
  setLayerVisible(privacyCover, false);
  setHostHidden(false);
});

document.querySelector("#close-public").addEventListener("click", leavePublicSafely);

document.querySelector("#public-fullscreen").addEventListener("click", async () => {
  if (!document.fullscreenElement) await publicScreen.requestFullscreen();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (publicScreen.classList.contains("visible")) {
      event.preventDefault();
      leavePublicSafely();
    }
  }
  if (event.key.toLowerCase() === "p" && state.currentResult && !event.metaKey && !event.ctrlKey) {
    renderPublicOverlay();
  }
});

render();
