export default function AuthField({ label, id, className = '', ...inputProps }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input id={inputId} className="form-input w-full" {...inputProps} />
    </div>
  )
}
