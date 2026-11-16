export function heightCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54)
}

export function heightMeters(feet: number, inches: number): number {
  return (feet * 12 + inches) * 0.0254
}

export function bodyMassIndex(kg: number, feet: number, inches: number): number {
  const m = heightMeters(feet, inches)
  return kg / (m * m)
}

export function formatBmi(kg: number, feet: number, inches: number): string {
  return (Math.round(bodyMassIndex(kg, feet, inches) * 10) / 10).toFixed(1)
}

export function kgToLb(kg: number): number {
  return kg * 2.2046226218
}

export function formatKgLb(kg: number): string {
  return `${kg.toFixed(1)} kg (${kgToLb(kg).toFixed(1)} lb)`
}
