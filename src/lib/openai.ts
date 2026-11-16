import type { MealItem } from '../types'
import { emptyItem } from './nutrition'

type VisionJson = {
  items?: Array<{
    name?: unknown
    portion?: unknown
    calories?: unknown
    protein?: unknown
    carbs?: unknown
    fat?: unknown
  }>
  reason?: unknown
}

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

export class VisionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VisionError'
  }
}

export async function analyzeMealPhoto(apiKey: string, dataUrl: string): Promise<MealItem[]> {
  const comma = dataUrl.indexOf(',')
  const header = comma >= 0 ? dataUrl.slice(0, comma) : ''
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  const mimeMatch = /data:(.*?);/.exec(header)
  const mime = mimeMatch?.[1] || 'image/jpeg'

  const endpoint = import.meta.env.DEV
    ? '/openai-proxy/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions'

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You estimate foods in a meal photo for personal tracking. Return JSON only. Values are estimates, not medical advice. Do not give a diet plan, calorie target, or exercise plan.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify each visible food. Estimate portion, calories, protein grams, carbs grams, and fat grams. JSON shape: {"items":[{"name":"","portion":"","calories":0,"protein":0,"carbs":0,"fat":0}],"reason":""}. If you cannot tell, return items:[] and a short reason.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mime};base64,${base64}` },
              },
            ],
          },
        ],
      }),
    })
  } catch {
    throw new VisionError(
      'Could not reach OpenAI. Check the connection, or enter this meal manually.',
    )
  }

  if (response.status === 401) {
    throw new VisionError('The OpenAI key was rejected. Check it in Settings.')
  }
  if (response.status === 429) {
    throw new VisionError('OpenAI rate-limited this request. Try again in a moment, or enter the meal manually.')
  }
  if (!response.ok) {
    throw new VisionError(`Scan failed (${response.status}). Enter the meal manually.`)
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = body.choices?.[0]?.message?.content
  if (!content) {
    throw new VisionError('OpenAI returned an empty estimate. Enter the meal manually.')
  }

  let parsed: VisionJson
  try {
    parsed = JSON.parse(content) as VisionJson
  } catch {
    throw new VisionError('Could not read the estimate. Enter the meal manually.')
  }

  const items = (parsed.items ?? [])
    .map((row) => {
      const item = emptyItem()
      item.name = str(row.name)
      item.portion = str(row.portion)
      item.calories = Math.round(num(row.calories))
      item.protein = Math.round(num(row.protein) * 10) / 10
      item.carbs = Math.round(num(row.carbs) * 10) / 10
      item.fat = Math.round(num(row.fat) * 10) / 10
      return item
    })
    .filter((item) => item.name.trim() || item.calories > 0)

  if (items.length === 0) {
    const reason = str(parsed.reason)
    throw new VisionError(
      reason
        ? `Nothing clear in that photo (${reason}). Enter the meal manually.`
        : 'Nothing clear in that photo. Enter the meal manually.',
    )
  }

  return items
}
