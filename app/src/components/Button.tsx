import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { buttonStyles } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonStyles
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className = '', type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={`${buttonStyles[variant]} ${className}`} {...props} />
  )
})
