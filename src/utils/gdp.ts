export function randomMultiplier(): number {
  // inclusive 1000..2000
  return Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
}

export function computeEstimatedGdp(population: number, rate: number): number {
  return (population * randomMultiplier()) / rate;
}
