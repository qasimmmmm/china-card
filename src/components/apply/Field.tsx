'use client'

import { useFormContext } from 'react-hook-form'
import { Check, Upload, FileText, X } from 'lucide-react'
import type { FieldDef } from '@/content/formSchema'
import { COUNTRIES, CHINA_CITIES } from '@/content/formSchema'
import { cn } from '@/lib/utils'

const MAX_FILE_MB = 8

function optionsFor(field: FieldDef): string[] {
  if (field.type === 'country') return COUNTRIES
  if (field.id === 'entryCity' || field.id === 'destinationCity') return CHINA_CITIES
  return field.options ?? []
}

export function Field({ field }: { field: FieldDef }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  const error = errors[field.id]?.message as string | undefined
  const value = watch(field.id)
  const invalid = cn(error && 'input-invalid')
  const describedBy = error ? `${field.id}-err` : field.hint ? `${field.id}-hint` : undefined

  function Label() {
    return (
      <label htmlFor={field.id} className="field-label">
        {field.label}
        {field.required && <span className="ml-0.5 text-accent">*</span>}
      </label>
    )
  }

  function Messages() {
    return (
      <>
        {field.hint && !error && (
          <p id={`${field.id}-hint`} className="field-hint">
            {field.hint}
          </p>
        )}
        {error && (
          <p id={`${field.id}-err`} className="field-error">
            {error}
          </p>
        )}
      </>
    )
  }

  // ── Radio (segmented) ──────────────────────────────────────
  if (field.type === 'radio') {
    const opts = optionsFor(field)
    return (
      <div>
        <Label />
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={field.label}>
          {opts.map((opt) => {
            const active = value === opt
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setValue(field.id, opt, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                className={cn(
                  'rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-soft'
                    : 'border-line bg-white text-ink-soft hover:border-brand-300 hover:bg-surface-soft',
                )}
              >
                {active && <Check  className="mr-1.5 -ml-0.5 inline h-4 w-4" aria-hidden="true" />}
                {opt}
              </button>
            )
          })}
        </div>
        <Messages />
      </div>
    )
  }

  // ── Checkboxes (array) ─────────────────────────────────────
  if (field.type === 'checkboxes') {
    const opts = optionsFor(field)
    const arr: string[] = Array.isArray(value) ? value : []
    const toggle = (opt: string) => {
      const none = 'None of the above'
      let next: string[]
      if (opt === none) {
        next = arr.includes(none) ? [] : [none]
      } else {
        next = arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr.filter((o) => o !== none), opt]
      }
      setValue(field.id, next, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
    }
    return (
      <div>
        <Label />
        <div className="flex flex-wrap gap-2">
          {opts.map((opt) => {
            const active = arr.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(opt)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-line bg-white text-ink-soft hover:border-brand-300',
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    active ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-muted/50',
                  )}
                >
                  {active && <Check  className="h-3 w-3" aria-hidden="true" />}
                </span>
                {opt}
              </button>
            )
          })}
        </div>
        <Messages />
      </div>
    )
  }

  // ── File upload ────────────────────────────────────────────
  if (field.type === 'file') {
    const fileName = (watch('passportFileName') as string) || ''
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setValue('passportFileName', `__too_large__${file.name}`)
        return
      }
      setValue('passportFileName', file.name, { shouldDirty: true })
      setValue(field.id, file.name, { shouldDirty: true })
    }
    const tooLarge = fileName.startsWith('__too_large__')
    const display = tooLarge ? fileName.replace('__too_large__', '') : fileName
    return (
      <div>
        <Label />
        {!display || tooLarge ? (
          <label
            htmlFor={field.id}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface-soft px-4 py-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40"
          >
            <Upload  className="h-6 w-6 text-brand-600" aria-hidden="true" />
            <span className="mt-2 text-sm font-semibold text-navy">Click to upload your passport page</span>
            <span className="mt-0.5 text-xs text-ink-muted">JPG, PNG or PDF · up to {MAX_FILE_MB} MB</span>
            <input id={field.id} type="file" accept="image/*,application/pdf" className="sr-only" onChange={onChange} />
          </label>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-ink">
              <FileText  className="h-4.5 w-4.5 text-brand-600" aria-hidden="true" />
              {display}
            </span>
            <button
              type="button"
              onClick={() => {
                setValue('passportFileName', '')
                setValue(field.id, '')
              }}
              className="text-ink-muted hover:text-accent"
              aria-label="Remove file"
            >
              <X  className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
        {tooLarge && <p className="field-error">That file is over {MAX_FILE_MB} MB. Please choose a smaller file.</p>}
        <Messages />
      </div>
    )
  }

  // ── Select / Country ───────────────────────────────────────
  if (field.type === 'select' || field.type === 'country') {
    const opts = optionsFor(field)
    return (
      <div>
        <Label />
        <select id={field.id} className={cn('select', invalid)} aria-describedby={describedBy} {...register(field.id)}>
          <option value="">{field.placeholder || 'Please select…'}</option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <Messages />
      </div>
    )
  }

  // ── Textarea ───────────────────────────────────────────────
  if (field.type === 'textarea') {
    return (
      <div>
        <Label />
        <textarea
          id={field.id}
          rows={3}
          maxLength={field.max}
          placeholder={field.placeholder}
          className={cn('textarea', invalid)}
          aria-describedby={describedBy}
          {...register(field.id)}
        />
        <Messages />
      </div>
    )
  }

  // ── Default input (text/email/tel/date) ────────────────────
  return (
    <div>
      <Label />
      <input
        id={field.id}
        type={field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
        maxLength={field.max}
        placeholder={field.placeholder}
        className={cn('input', invalid)}
        aria-describedby={describedBy}
        {...register(field.id)}
      />
      <Messages />
    </div>
  )
}
