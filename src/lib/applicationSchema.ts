import { z } from 'zod'
import { steps, type FieldDef } from '@/content/formSchema'

/** All field definitions, flattened. */
export const allFields: FieldDef[] = steps.flatMap((s) => s.fields)

/** Is a conditional field currently visible given the form values? */
export function isVisible(field: FieldDef, values: Record<string, unknown>): boolean {
  if (!field.showIf) return true
  const v = values[field.showIf.field]
  return typeof v === 'string' && field.showIf.in.includes(v)
}

/** Field ids that belong to a step (used for per-step validation gating). */
export function stepFieldIds(stepIndex: number): string[] {
  return steps[stepIndex].fields.map((f) => f.id)
}

const isValidDate = (s: string) => !!s && !Number.isNaN(Date.parse(s))

/**
 * Base shape: everything optional/lenient, so the resolver never crashes on a
 * partially-filled multi-step form. Real requirements are enforced in
 * superRefine, which respects conditional visibility.
 */
function baseShape() {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of allFields) {
    if (f.type === 'checkboxes') shape[f.id] = z.array(z.string()).default([])
    else shape[f.id] = z.string().default('')
  }
  shape.plan = z.enum(['standard', 'priority', 'express']).default('standard')
  shape.passportFileName = z.string().default('')
  shape.signature = z.string().default('') // PNG data-URL of the customer's signature
  shape.agreeTruth = z.boolean().default(false)
  shape.agreeTerms = z.boolean().default(false)
  shape.agreeAuthorize = z.boolean().default(false)
  return shape
}

export const applicationSchema = z
  .object(baseShape())
  .superRefine((values, ctx) => {
    const v = values as Record<string, unknown>
    for (const f of allFields) {
      if (!isVisible(f, v)) continue
      const val = v[f.id]

      // The passport photo has its own check below (must be a real image).
      if (f.type === 'file') continue

      // Required checks (respecting visibility)
      if (f.required) {
        if (f.type === 'checkboxes') {
          if (!Array.isArray(val) || val.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f.id], message: 'Please choose at least one option.' })
          }
        } else if (typeof val !== 'string' || val.trim() === '') {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f.id], message: 'This field is required.' })
          continue
        }
      }

      // Format checks (only when a value is present)
      if (typeof val === 'string' && val.trim() !== '') {
        if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f.id], message: 'Enter a valid email address.' })
        }
        if (f.type === 'tel' && !/^[+]?[\d\s().-]{6,20}$/.test(val)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f.id], message: 'Enter a valid phone number.' })
        }
        if (f.type === 'date' && !isValidDate(val)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f.id], message: 'Enter a valid date.' })
        }
      }
    }

    // Date sanity
    if (typeof v.dob === 'string' && isValidDate(v.dob) && Date.parse(v.dob) > Date.now()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dob'], message: 'Date of birth cannot be in the future.' })
    }

    // Passport photo — the official NIA portal's first step is a mandatory OCR
    // scan of the passport data page; the form will not open without it.
    if (typeof v.passportImage !== 'string' || !v.passportImage.startsWith('data:image')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['passportImage'], message: 'Please upload a clear photo of your passport data page — the official portal requires it to open your Arrival Card.' })
    }

    // Final-step: signature + consents + authorization to submit on their behalf
    if (typeof v.signature !== 'string' || !v.signature.startsWith('data:image')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['signature'], message: 'Please sign — the official Arrival Card requires your signature.' })
    }
    if (v.agreeTruth !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['agreeTruth'], message: 'Please confirm your details are true and accurate.' })
    }
    if (v.agreeTerms !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['agreeTerms'], message: 'Please accept the Terms and acknowledge this is an independent service.' })
    }
    if (v.agreeAuthorize !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['agreeAuthorize'], message: 'Please authorize us to complete, sign, and submit your Arrival Card on your behalf.' })
    }
  })

export type ApplicationValues = z.infer<typeof applicationSchema>

/** Default empty values for the form. */
export function emptyApplication(plan: ApplicationValues['plan'] = 'standard'): Record<string, unknown> {
  const out: Record<string, unknown> = { plan, passportFileName: '', signature: '', agreeTruth: false, agreeTerms: false, agreeAuthorize: false }
  for (const f of allFields) out[f.id] = f.type === 'checkboxes' ? [] : ''
  return out
}
