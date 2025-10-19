/**
 * Example Frontend Component Test
 * Demonstrates React component testing with Vitest and Testing Library
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple example component for demonstration
function ExampleComponent({ message }: { message: string }) {
  return (
    <div>
      <h1>ChulasArts</h1>
      <p>{message}</p>
    </div>
  );
}

describe('ExampleComponent', () => {
  it('renders the component with message', () => {
    render(<ExampleComponent message="Hello World" />);

    expect(screen.getByText('ChulasArts')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders different messages', () => {
    const { rerender } = render(<ExampleComponent message="First" />);
    expect(screen.getByText('First')).toBeInTheDocument();

    rerender(<ExampleComponent message="Second" />);
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
