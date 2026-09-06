import { useState, useCallback, useMemo, useEffect } from "react"
import { useSetAtom } from 'jotai'
import { sessionIdAtom } from '@/store/store'
import pushData from '@/api/data/pushData'
import { TRules } from "@/types/form/rules.types"
import { Field, Fields, Rules, FieldName } from "@/types/form/field.types"
import { Toast } from "@/types/form/field.types"
import sendMessage from "@/api/send/sendMessage"

const DRAFT_KEY: string = 'form_draft'

export const RULES: TRules = {
  name: { min: 2, max: 30, required: true },
  subname: { min: 2, max: 30, required: true },
  email: { min: 5, max: 50, required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: 'Invalid email format' },
  topic: { required: true },
  country: { min: 2, max: 50, required: false },
  message: { min: 10, max: 5000, required: true },
} as const

export const TOPICS = [
  { value: 'question', label: 'Question' },
  { value: 'bug', label: 'Bug report' },
  { value: 'collab', label: 'Collaboration' },
  { value: 'other', label: 'Other' },
] as const

const validateField = (
  value: string,
  rules?: Rules<typeof RULES>[FieldName]
): string[] => {
  if (!rules) return []
  const errors: string[] = []
  const { required, min, max, pattern, patternMessage } = rules as any

  if (required && !value?.trim()) {
    errors.push('This field is required')
    return errors
  }
  if (value && min && value.length < min) errors.push(`At least ${min} characters`)
  if (value && max && value.length > max) errors.push(`Max ${max} characters`)
  if (value && pattern && !pattern.test(value)) errors.push(patternMessage || 'Invalid format')
  return errors
}

const makeField = (value = ''): Field => ({
  value,
  errors: [],
  touched: false,
})

const INITIAL_FIELDS: Fields = {
  name: makeField(),
  subname: makeField(),
  email: makeField(),
  topic: makeField(),
  country: makeField(),
  message: makeField(),
}

const loadDraft = (): Fields => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return INITIAL_FIELDS
    const saved = JSON.parse(raw) as Partial<Record<FieldName, string>>
    const fieldKeys = Object.keys(INITIAL_FIELDS) as Array<FieldName>

    return fieldKeys.reduce((acc, key) => {
      const value = saved[key] ?? ''
      acc[key] = {
        value,
        errors: validateField(value, RULES[key]),
        touched: value.trim().length > 0,
      }
      return acc
    }, {} as Fields)
  } catch {
    return INITIAL_FIELDS
  }
}

const useForm = () => {
  const [fields, setFields] = useState<Fields>(loadDraft)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [toast, setToast] = useState<Toast>(null)

  // ── записываем sessionId глобально через атом ──────────────────────────
  const setSessionId = useSetAtom(sessionIdAtom)

  // ── сохранение черновика ───────────────────────────────────────────────
  useEffect(() => {
    if (submitStatus === 'success') return
    const draft = Object.fromEntries(
      (Object.keys(fields) as FieldName[]).map(key => [key, fields[key].value])
    ) as Record<FieldName, string>
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [fields, submitStatus])

  const onChange = useCallback((fieldName: FieldName, value: string) => {
    const errors = validateField(value, RULES[fieldName])
    setFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value, errors },
    }))
  }, [])

  const onBlur = useCallback((fieldName: FieldName) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], touched: true },
    }))
  }, [])

  const isValid = useMemo(() =>
    (Object.entries(RULES) as Array<[FieldName, Rules<Partial<typeof RULES>>[FieldName]]>)
      .every(([key, rules]) => {
        if (!rules || !rules.required) return true
        return fields[key].value.trim() && fields[key].errors.length === 0
      }),
    [fields])

  const countOfWords = useMemo(() =>
    Number(`${fields.message.value.length}/${RULES.message.max}`) || '0/5000',
    [fields.message.value])

  const validationError = useMemo(() => {
    for (const key of Object.keys(RULES) as FieldName[]) {
      const rules = RULES[key]
      if (!rules || !rules.required) continue
      const field = fields[key]
      if (!field.value.trim()) {
        const parsedKey = key[0].toUpperCase() + key.slice(1)
        return `"${parsedKey}" is required`
      }
      if (field.errors.length > 0) return field.errors[0]
    }
    return null
  }, [fields])

  const onSubmit = useCallback(async (e: any) => {
    e.preventDefault()

    setFields(prev => {
      const next = { ...prev };
      (Object.keys(next) as FieldName[]).forEach((key) => {
        next[key] = { ...next[key], touched: true }
      })
      return next
    })

    if (!isValid) {
      setToast({ type: 'error', text: validationError ?? 'Please fix the errors' })
      return
    }

    setSubmitStatus('loading')

    try {
      const result = await pushData({
        name: fields.name.value,
        subname: fields.subname.value,
        email: fields.email.value,
        topic: fields.topic.value,
        country: fields.country.value,
        message: fields.message.value,
      })

      if (result?.sessionId) {
        setSessionId(result.sessionId)
      }

      setSubmitStatus('success')
      setToast({ type: 'success', text: "Message sent! I'll get back to you soon." })
      localStorage.removeItem(DRAFT_KEY)

    } catch (err) {
      setSubmitStatus('error')
      setToast({ type: 'error', text: 'Something went wrong. Please try again.' })
    }
  }, [fields, isValid, validationError, setSessionId])

  return {
    fields,
    onChange,
    onBlur,
    onSubmit,
    isValid,
    submitStatus,
    countOfWords,
    toast,
    setToast,
  }
}

export default useForm