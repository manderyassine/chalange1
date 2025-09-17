export default function InputWithIcon({ icon, type = 'text', value, onChange, placeholder, className = '', ...props }) {
  return (
    <label className={`ui ${className}`}>
      <i className={`uil ${icon}`} />
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="grow" {...props} />
    </label>
  )
}
