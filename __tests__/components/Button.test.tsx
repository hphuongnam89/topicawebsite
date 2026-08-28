import { render, screen } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import { Button, ButtonLink } from '@/components/ui/Button'

describe('Button components', () => {
  test('Button renders correct semantic element', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
  })

  test('ButtonLink renders as an anchor', () => {
    render(<ButtonLink href="/test">Go to test</ButtonLink>)
    const link = screen.getByRole('link', { name: 'Go to test' })
    expect(link).toHaveAttribute('href', '/test')
  })
})
