// FormField keeps labels, helper text, and inputs consistent across frontend-only forms.
function FormField({ helperText, label, ...inputProps }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
        {...inputProps}
      />
      {helperText ? (
        <span className="mt-2 block text-xs text-slate-500">{helperText}</span>
      ) : null}
    </label>
  )
}

export default FormField
