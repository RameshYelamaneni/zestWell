export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

export type MealItem = {
  id: string
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type Meal = {
  id: string
  date: string
  mealType: MealType
  items: MealItem[]
  photoDataUrl?: string
  source: 'scan' | 'manual'
  createdAt: string
  updatedAt: string
}

export type WhoopActivity = {
  id: string
  name: string
  minutes?: number
}

export type WhoopDay = {
  date: string
  steps?: number
  activities: WhoopActivity[]
  strain?: number
  recovery?: number
  sleepPerformance?: number
  hoursSlept?: number
}

export type WeightEntry = {
  id: string
  date: string
  kg: number
  createdAt: string
}

export type LabResult = {
  id: string
  date: string
  time?: string
  testName: string
  value: number
  unit: string
  referenceRange?: string
  source?: string
}

export type Profile = {
  name: string
  age: number
  sex: 'male' | 'female' | 'other'
  heightFeet: number
  heightInches: number
  targetWeightKg: number
  targetNote: string
}

export type Settings = {
  openaiKey: string
}

export type AppData = {
  version: 1
  profile: Profile
  meals: Meal[]
  whoop: WhoopDay[]
  weights: WeightEntry[]
  labs: LabResult[]
  settings: Settings
}

export type AuthRecord = {
  username: string
  salt: string
  pinHash: string
  createdAt: string
}

export type Session = {
  username: string
  loggedInAt: string
}

export type Tab =
  | 'today'
  | 'meals'
  | 'weight'
  | 'health'
  | 'summaries'
  | 'settings'

export type ExportPayload = {
  version: 1
  exportedAt: string
  profile: Profile
  meals: Meal[]
  whoop: WhoopDay[]
  weights: WeightEntry[]
  labs: LabResult[]
}
