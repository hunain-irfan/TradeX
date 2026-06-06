import PasswordInput from '../ui/PasswordInput'

export default function AuthField({ label, id, className = '', type, ...inputProps }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const isPassword = type === 'password'

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      {isPassword ? (
        <PasswordInput id={inputId} {...inputProps} />
      ) : (
        <input id={inputId} type={type} className="form-input w-full" {...inputProps} />
      )}
    </div>
  )
}
