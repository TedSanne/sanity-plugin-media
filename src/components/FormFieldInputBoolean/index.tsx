import {Box, Switch} from '@sanity/ui'
import React, {forwardRef} from 'react'

import FormFieldInputLabel from '../FormFieldInputLabel'

type Props = {
  description?: string
  disabled?: boolean
  error?: string
  label: string
  name: string
  checked?: boolean
}

type Ref = HTMLInputElement

const FormFieldInputBoolean = forwardRef<Ref, Props>((props: Props, ref) => {
  const {description, disabled, error, label, name, checked, ...rest} = props

  return (
    <Box>
      {/* Label */}
      <FormFieldInputLabel description={description} error={error} label={label} name={name} />
      {/* Input */}
      <Switch
        {...rest}
        disabled={disabled}
        autoFocus
        id={name}
        ref={ref}
        name={name}
        checked={!!checked}
      />
    </Box>
  )
})

export default FormFieldInputBoolean
