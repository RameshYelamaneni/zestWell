import type { AppData, LabResult, Profile, WeightEntry } from '../types'
import { nid } from './ids'

export const DEFAULT_PROFILE: Profile = {
  name: 'Ramesh',
  age: 33,
  sex: 'male',
  heightFeet: 5,
  heightInches: 8,
  targetWeightKg: 76,
  targetNote: 'by end of January / mid-February 2027',
}

const BASELINE_DATE = '2026-11-15'
const BASELINE_TIME = '09:08'

function lab(
  testName: string,
  value: number,
  unit: string,
  referenceRange?: string,
): LabResult {
  return {
    id: nid(),
    date: BASELINE_DATE,
    time: BASELINE_TIME,
    testName,
    value,
    unit,
    referenceRange,
    source: 'Evolt 360',
  }
}

export function seededLabs(): LabResult[] {
  return [
    lab('Weight', 86, 'kg'),
    lab('Body Fat', 30.9, '%', '8–19 typical male'),
    lab('Visceral Fat Level', 13, '', '1–12'),
    lab('Visceral Fat Area', 127, 'cm²', '<100'),
    lab('BMR', 1653, 'kcal'),
    lab('TEE', 2545, 'kcal'),
    lab('Bio Age', 37, ''),
    lab('BWI Score', 6.3, ''),
    lab('Waist-to-Hip Ratio', 0.92, '', '<0.90'),
    lab('Lean Body Mass', 131.0, 'lb'),
    lab('Skeletal Muscle Mass', 71.9, 'lb'),
    lab('Abdominal Circumference', 40.3, 'in'),
  ]
}

export function seededWeights(): WeightEntry[] {
  return [
    {
      id: nid(),
      date: BASELINE_DATE,
      kg: 86,
      createdAt: `${BASELINE_DATE}T09:08:00`,
    },
  ]
}

export function createSeededData(): AppData {
  return {
    version: 1,
    profile: { ...DEFAULT_PROFILE },
    meals: [],
    whoop: [],
    weights: seededWeights(),
    labs: seededLabs(),
    settings: { openaiKey: '' },
  }
}
