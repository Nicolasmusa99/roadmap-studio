import { useEffect } from 'react'

interface Props {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="drag-toast" role="alert" onClick={onClose}>
      <span className="drag-toast-icon">⊘</span>
      <span>{message}</span>
    </div>
  )
}
