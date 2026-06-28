interface Props {
  title: string
  action?: React.ReactNode
}

export default function PageHeader({ title, action }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      {action}
    </div>
  )
}
