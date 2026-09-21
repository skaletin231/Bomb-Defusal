import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import PropTypes from 'prop-types'
import { useId } from 'react'

/**
 * This component is a placeholder for FormControl to correctly set the shrink label state on SSR.
 */
// function SSRInitialFilled(_) {
//   return null
// }
// SSRInitialFilled.muiName = 'Input'

function NumberField({ id: idProp, label, error, size = 'medium', ...other }) {
  let id = useId()
  if (idProp) {
    id = idProp
  }
  return (
    <BaseNumberField.Root
      {...other}
      render={(props, state) => (
        <FormControl
          size={size}
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          variant='outlined'
          sx={other.sx}
        >
          {props.children}
        </FormControl>
      )}
    >
      {/* <SSRInitialFilled {...other} /> */}
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <BaseNumberField.Input
        id={id}
        render={(props, state) => (
          <OutlinedInput
            aria-describedby={`${id}-helper-text`}
            label={label}
            inputRef={props.ref}
            value={state.inputValue}
            onBlur={props.onBlur}
            onChange={props.onChange}
            onKeyUp={props.onKeyUp}
            onKeyDown={props.onKeyDown}
            onFocus={props.onFocus}
            slotProps={{
              input: props,
            }}
            sx={{ pr: 0 }}
          />
        )}
      />
    </BaseNumberField.Root>
  )
}

NumberField.propTypes = {
  error: PropTypes.bool,
  /**
   * The id of the input element.
   */
  id: PropTypes.string,
  label: PropTypes.node,
  size: PropTypes.oneOf(['medium', 'small']),
}

export default NumberField
