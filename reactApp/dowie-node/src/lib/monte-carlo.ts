export interface SimulationParams {
  spotPrice: number;
  strikePrice: number;
  volatility: number; // as decimal, e.g. 0.25 for 25%
  riskFreeRate: number; // as decimal
  timeToExpiry: number; // in years
  numSimulations: number;
}

export interface SimulationResult {
  callPrice: number;
  putPrice: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  simulatedPrices: number[];
  timestamp: string;
  params: SimulationParams;
}

// Box-Muller transform for normal random numbers
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Standard normal CDF approximation
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

export function runMonteCarloSimulation(params: SimulationParams): SimulationResult {
  const { spotPrice, strikePrice, volatility, riskFreeRate, timeToExpiry, numSimulations } = params;

  const dt = timeToExpiry;
  const drift = (riskFreeRate - 0.5 * volatility * volatility) * dt;
  const diffusion = volatility * Math.sqrt(dt);
  const discount = Math.exp(-riskFreeRate * dt);

  const simulatedPrices: number[] = [];
  let callPayoffSum = 0;
  let putPayoffSum = 0;

  for (let i = 0; i < numSimulations; i++) {
    const z = gaussianRandom();
    const ST = spotPrice * Math.exp(drift + diffusion * z);
    simulatedPrices.push(ST);

    callPayoffSum += Math.max(ST - strikePrice, 0);
    putPayoffSum += Math.max(strikePrice - ST, 0);
  }

  const callPrice = discount * (callPayoffSum / numSimulations);
  const putPrice = discount * (putPayoffSum / numSimulations);

  // Analytical Greeks using Black-Scholes formulas
  const d1 = (Math.log(spotPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / (volatility * Math.sqrt(timeToExpiry));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

  const delta = normalCDF(d1);
  const gamma = Math.exp(-d1 * d1 / 2) / (Math.sqrt(2 * Math.PI) * spotPrice * volatility * Math.sqrt(timeToExpiry));
  const theta = -(spotPrice * volatility * Math.exp(-d1 * d1 / 2)) / (2 * Math.sqrt(2 * Math.PI * timeToExpiry)) - riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2);
  const vega = spotPrice * Math.sqrt(timeToExpiry) * Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI);

  return {
    callPrice,
    putPrice,
    delta,
    gamma,
    theta: theta / 365, // per day
    vega: vega / 100, // per 1% move
    simulatedPrices,
    timestamp: new Date().toISOString(),
    params,
  };
}
