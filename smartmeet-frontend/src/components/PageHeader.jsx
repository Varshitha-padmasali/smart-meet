// PageHeader provides a consistent title area for dashboard and meeting pages.
function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
      ) : null}
    </div>
  )
}

export default PageHeader
