import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock the LoadingSpinner component that Button imports
jest.mock('./Loading', () => ({
  LoadingSpinner: ({ size, color }) => (
    <div data-testid="loading-spinner" data-size={size} data-color={color} />
  ),
}));

import Button, {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  DangerButton,
  SuccessButton,
  WarningButton,
  IconButton,
  ButtonGroup,
  FloatingActionButton,
} from './Button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render button with children', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render with default props', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('onClick Handler', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click Me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} loading>Click Me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      render(<Button disabled>Disabled Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have disabled styling class', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('opacity-50');
      expect(button.className).toContain('cursor-not-allowed');
    });
  });

  describe('Type Prop', () => {
    it('should render with button type by default', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should render with specified type', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should render with reset type', () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('Icon Support', () => {
    it('should render with icon element', () => {
      const icon = <span data-testid="test-icon">★</span>;
      render(<Button icon={icon}>With Icon</Button>);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });
});

describe('Button Variants', () => {
  it('should render PrimaryButton with primary variant', () => {
    render(<PrimaryButton>Primary</PrimaryButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-purple-600');
  });

  it('should render SecondaryButton with secondary variant', () => {
    render(<SecondaryButton>Secondary</SecondaryButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-white');
  });

  it('should render OutlineButton with outline variant', () => {
    render(<OutlineButton>Outline</OutlineButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-transparent');
    expect(button.className).toContain('border-purple-600');
  });

  it('should render GhostButton with ghost variant', () => {
    render(<GhostButton>Ghost</GhostButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-transparent');
  });

  it('should render DangerButton with danger variant', () => {
    render(<DangerButton>Danger</DangerButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-red-600');
  });

  it('should render SuccessButton with success variant', () => {
    render(<SuccessButton>Success</SuccessButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-green-600');
  });

  it('should render WarningButton with warning variant', () => {
    render(<WarningButton>Warning</WarningButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-yellow-600');
  });
});

describe('IconButton Component', () => {
  it('should render icon button', () => {
    render(<IconButton>★</IconButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should apply icon-specific padding classes', () => {
    render(<IconButton size="md">★</IconButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('p-2');
  });

  it('should use ghost variant by default', () => {
    render(<IconButton>★</IconButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-transparent');
  });
});

describe('ButtonGroup Component', () => {
  it('should render button group with children', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('should render as a div with role group', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    );
    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
  });
});

describe('FloatingActionButton Component', () => {
  it('should render FAB', () => {
    render(<FloatingActionButton>+</FloatingActionButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should have rounded-full class', () => {
    render(<FloatingActionButton>+</FloatingActionButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('rounded-full');
  });

  it('should have purple background', () => {
    render(<FloatingActionButton>+</FloatingActionButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-purple-600');
  });

  it('should render with custom size', () => {
    render(<FloatingActionButton size="lg">+</FloatingActionButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-14');
    expect(button.className).toContain('w-14');
  });
});
