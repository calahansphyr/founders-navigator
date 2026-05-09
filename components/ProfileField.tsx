'use client'

interface Props {
  label: string
  icon: string
  value: string
  isAssumed: boolean
  onChange: (value: string) => void
}

export default function ProfileField({ label, icon, value, isAssumed, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 p-6 hover:bg-surface transition-colors duration-150 group">
      <dt className="flex items-center gap-3 w-52">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-innovation-orange">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
            {label}
          </span>
          {isAssumed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
              Assumed
            </span>
          )}
        </div>
      </dt>
      <dd>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-body-lg text-deep-navy font-medium bg-transparent border-none focus:ring-1 focus:ring-gold rounded px-2 py-1 outline-none"
        />
      </dd>
    </div>
  )
}
