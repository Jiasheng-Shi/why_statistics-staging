const VALID_MODES = new Set(["stealth", "down", "up"]);
const MODE_MEANS = Object.freeze({ stealth: 50, down: 25, up: 75 });

function checkPlayers(players, name, expectedLength = null) {
  if (!Array.isArray(players)) {
    throw new TypeError(`${name} 必须是座位号数组。`);
  }

  if (expectedLength !== null && players.length !== expectedLength) {
    throw new RangeError(`${name} 必须恰好包含 ${expectedLength} 名玩家。`);
  }

  if (players.some((player) => !Number.isInteger(player) || player < 1 || player > 8)) {
    throw new RangeError(`${name} 只能包含 1 到 8 的整数座位号。`);
  }

  if (new Set(players).size !== players.length) {
    throw new RangeError(`${name} 不能包含重复座位号。`);
  }
}

export function secureUniform() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("当前浏览器不支持安全随机数生成。");
  }

  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return (buffer[0] + 0.5) / 4294967296;
}

export function standardNormal(rng = secureUniform) {
  const u1 = rng();
  const u2 = rng();

  if (
    !Number.isFinite(u1) || !Number.isFinite(u2) ||
    u1 <= 0 || u1 >= 1 || u2 <= 0 || u2 >= 1
  ) {
    throw new Error("随机数函数必须返回严格位于 (0, 1) 的有限数值。");
  }

  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function judgeRound(records, { sigma = 10, critical = 1.5 } = {}) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new TypeError("records 必须是非空数组。");
  }

  const signalValues = records
    .filter((record) => record.role === "Signal")
    .map((record) => record.value);
  const noiseValues = records
    .filter((record) => record.role === "Noise")
    .map((record) => record.value);

  if (signalValues.length === 0) {
    throw new RangeError("车上必须至少有一名 Signal（好人）。");
  }

  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const signalMean = mean(signalValues);

  if (noiseValues.length === 0) {
    return {
      signalMean,
      noiseMean: null,
      z: 0,
      critical,
      failed: false,
      result: "SUCCESS",
      resultCn: "任务成功"
    };
  }

  const noiseMean = mean(noiseValues);
  const k = noiseValues.length;
  const s = signalValues.length;
  const z = Math.abs(noiseMean - signalMean) / (sigma * Math.sqrt(1 / k + 1 / s));
  const failed = z > critical;

  return {
    signalMean,
    noiseMean,
    z,
    critical,
    failed,
    result: failed ? "FAIL" : "SUCCESS",
    resultCn: failed ? "任务失败" : "任务成功"
  };
}

export function generateRound({
  riders,
  noisePlayers,
  noiseModes = {},
  rng = secureUniform,
  sigma = 10,
  critical = 1.5
}) {
  checkPlayers(riders, "riders");
  checkPlayers(noisePlayers, "noisePlayers", 2);

  if (![3, 4, 5].includes(riders.length)) {
    throw new RangeError("车队人数必须是 3、4 或 5 人。");
  }

  const noiseSet = new Set(noisePlayers);
  const noiseOnCar = riders.filter((player) => noiseSet.has(player));
  const suppliedModePlayers = Object.keys(noiseModes).map(Number);

  if (
    suppliedModePlayers.some((player) => !Number.isInteger(player)) ||
    suppliedModePlayers.length !== noiseOnCar.length ||
    suppliedModePlayers.some((player) => !noiseOnCar.includes(player)) ||
    noiseOnCar.some((player) => !suppliedModePlayers.includes(player))
  ) {
    throw new RangeError("noiseModes 必须恰好包含本轮上车的 Noise 座位号。");
  }

  noiseOnCar.forEach((player) => {
    if (!VALID_MODES.has(noiseModes[player])) {
      throw new RangeError(`玩家 ${player} 的 Noise 模式无效。`);
    }
  });

  const records = riders.map((player) => {
    const isNoise = noiseSet.has(player);
    const mode = isNoise ? noiseModes[player] : "signal";
    const mean = isNoise ? MODE_MEANS[mode] : 50;
    const rawValue = mean + sigma * standardNormal(rng);
    const value = Number(rawValue.toFixed(1));

    return {
      player,
      role: isNoise ? "Noise" : "Signal",
      mode,
      mean,
      value
    };
  });

  const judgment = judgeRound(records, { sigma, critical });

  return {
    slips: records.map(({ player, value }) => ({ player, value })),
    public: {
      values: records.map(({ value }) => value).sort((a, b) => a - b),
      result: judgment.result,
      resultCn: judgment.resultCn,
      failed: judgment.failed
    },
    host: {
      records,
      ...judgment
    }
  };
}
