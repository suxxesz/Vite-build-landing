import clsx from 'clsx'
import React, { useContext ,  useMemo , memo } from 'react'
import './Field.scss'
import { FormContext } from '@/context/FormContext'
import { TOPICS } from '@/hooks/useForm'
import { IFieldProps } from '@/types/form/field.types'
import { TFormContext } from '@/types/form/formContext.types'
import ReactSelect, { SingleValue, StylesConfig } from 'react-select'

type TOption = { value: string; label: string }


const topicOptions: TOption[] = TOPICS as unknown as TOption[]
const customComponents = {
  DropdownIndicator: () => null,
  IndicatorSeparator: () => null,
}

const selectStyles: StylesConfig<TOption, false> = useMemo(() => {
  return {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control:    (base) => ({ ...base, background: 'transparent', border: 'none', boxShadow: 'none', minHeight: 'unset'  , padding : "5px 0px 0px", fontSize : '14px'}) ,
  menu:       (base) => ({ ...base, background: 'rgba(95, 67, 165, 0.3)', backdropFilter: 'blur(16px)' }),
  option:     (base, state) => ({
    ...base,
    background: state.isSelected
      ? 'rgba(29, 18, 18, 0.14)'
      : state.isFocused
        ? 'rgba(255,255,255,0.05)'
        : 'transparent',
    color: state.isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
  }),
  singleValue: (base) => ({ ...base, color: '#fff' }),
  placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.35)' }),
  input:       (base) => ({ ...base, color: '#fff' }),
  }
} , [])

function Field({
  label,
  id,
  type = 'text',
  className,
  isTextPole = false,
  isSelect = false,
  value,
  onChange,
  onBlur,
  errors = [],
  touched = false,
  icon,
}: IFieldProps & { icon?: React.ReactNode }) {
  const { countOfWords } = useContext(FormContext) as Pick<TFormContext, 'countOfWords'>

  const hasError  = touched && errors.length > 0
  const isSuccess = touched && errors.length === 0 && value.trim().length > 0
  const errorId   = `${id}-error`

  const sharedInputProps = {
    id,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onBlur,
    'aria-invalid': hasError ? ('true' as const) : undefined,
    'aria-describedby': hasError ? errorId : undefined,
    className: clsx(
      'field__input',
      isTextPole  && 'field__input--textarea',
      hasError    && 'field__input--error',
      isSuccess   && 'field__input--success',
    ),
  }
  const selectValue: TOption | null = useMemo(
  () => topicOptions.find((o) => o.value === value) ?? null,
  [value]
)

  return (
    <div
      className={clsx(
        className,
        'field',
        hasError  && 'field--error',
        isSuccess && 'field--success',
      )}
    >
      <label
        className={clsx('field__label', isTextPole && 'field__label--textarea')}
        htmlFor={id}
        data-id="topic"
      >
        {icon && <span className="field__label-icon">{icon}</span>}
        <span className="field__label-text">{label}</span>
      </label>

      {isSelect ? (
        <ReactSelect<TOption, false>
          inputId={id}
          instanceId={id || "country-select-instance"}
          options={topicOptions}
          value={selectValue}
          onChange={(opt: SingleValue<TOption>) => onChange(opt?.value ?? '')}
          onBlur={onBlur}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={clsx(
            'field__input',
            'field__select',
            hasError  && 'field__input--error',
            isSuccess && 'field__input--success',
          )}
          classNamePrefix="country__select"
          menuPortalTarget={document.body}
          styles={selectStyles}
          isClearable
          placeholder=""
          menuPosition="fixed"
          components={customComponents}
        />

      ) : isTextPole ? (
        <>
          <textarea {...sharedInputProps} placeholder=" " />
          <span className="field__input--textarea--counter" aria-hidden="true">
            {countOfWords}
          </span>
        </>

      ) : (
        <input {...sharedInputProps} type={type} placeholder=" " />
      )}

      {hasError && (
        <span id={errorId} role="alert" aria-live="polite" className="field__error">
          {errors.at(-1)}
        </span>
      )}
    </div>
  )
}
export default memo(Field)