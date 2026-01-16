interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'default' | 'narrow' | 'wide'
}

const sizes = {
  narrow: 'max-w-4xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl'
}

export default function Container({
  children,
  className = '',
  size = 'default'
}: ContainerProps) {
  return (
    <div className={`w-full ${sizes[size]} mx-auto px-6 md:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  )
}
