import {Box, TextInput} from '@sanity/ui'
import React, {forwardRef} from 'react'

import FormFieldInputLabel from '../FormFieldInputLabel'

type Props = {
  description?: string
  disabled?: boolean
  error?: string
  label: string
  name: string
  placeholder?: string
  value?: number
}

type Ref = HTMLInputElement

const FormFieldInputNumber = forwardRef<Ref, Props>((props: Props, ref) => {
  const {description, disabled, error, label, name, placeholder, value, ...rest} = props

  return (
    <Box>
      {/* Label */}
      <FormFieldInputLabel description={description} error={error} label={label} name={name} />
      {/* Input */}
      <TextInput
        {...rest}
        autoComplete="off"
        autoFocus
        defaultValue={value}
        disabled={disabled}
        id={name}
        name={name}
        placeholder={placeholder}
        type="number"
        ref={ref}
      />
    </Box>
  )
})

export default FormFieldInputNumber
