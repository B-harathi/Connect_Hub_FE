import React from 'react';
import { render, screen } from '@testing-library/react';

import {
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
  LoadingScreen,
  LoadingSkeleton,
  LoadingButton,
  LoadingCard,
  LoadingChat,
  LoadingTable,
} from './Loading';

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('should render spinner', () => {
      render(<LoadingSpinner />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should apply size classes correctly', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(document.querySelector('.h-4')).toBeInTheDocument();

      rerender(<LoadingSpinner size="lg" />);
      expect(document.querySelector('.h-8')).toBeInTheDocument();

      rerender(<LoadingSpinner size="xl" />);
      expect(document.querySelector('.h-12')).toBeInTheDocument();
    });

    it('should apply color classes correctly', () => {
      const { rerender } = render(<LoadingSpinner color="purple" />);
      expect(document.querySelector('.border-purple-500')).toBeInTheDocument();

      rerender(<LoadingSpinner color="white" />);
      expect(document.querySelector('.border-white')).toBeInTheDocument();

      rerender(<LoadingSpinner color="gray" />);
      expect(document.querySelector('.border-gray-500')).toBeInTheDocument();
    });

    it('should have border-b-2 class for spinning effect', () => {
      render(<LoadingSpinner />);
      expect(document.querySelector('.border-b-2')).toBeInTheDocument();
    });
  });

  describe('LoadingDots', () => {
    it('should render three dots', () => {
      render(<LoadingDots />);
      const dots = document.querySelectorAll('.bg-purple-500');
      expect(dots).toHaveLength(3);
    });

    it('should apply size classes correctly', () => {
      const { rerender } = render(<LoadingDots size="sm" />);
      expect(document.querySelector('.h-1')).toBeInTheDocument();
      expect(document.querySelector('.w-1')).toBeInTheDocument();

      rerender(<LoadingDots size="md" />);
      expect(document.querySelector('.h-2')).toBeInTheDocument();
      expect(document.querySelector('.w-2')).toBeInTheDocument();

      rerender(<LoadingDots size="lg" />);
      expect(document.querySelector('.h-3')).toBeInTheDocument();
      expect(document.querySelector('.w-3')).toBeInTheDocument();
    });

    it('should use flex container', () => {
      render(<LoadingDots />);
      const flexContainer = document.querySelector('.flex');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('LoadingPulse', () => {
    it('should render pulse animation div', () => {
      render(<LoadingPulse />);
      const pulse = document.querySelector('.animate-pulse');
      expect(pulse).toBeInTheDocument();
    });

    it('should contain a child div with rounded class', () => {
      render(<LoadingPulse />);
      const roundedDiv = document.querySelector('.rounded');
      expect(roundedDiv).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LoadingPulse className="custom-class" />);
      expect(document.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('LoadingScreen', () => {
    it('should render loading screen with default message', () => {
      render(<LoadingScreen />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render loading screen with custom message', () => {
      render(<LoadingScreen message="Please wait..." />);
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('should have spinner', () => {
      render(<LoadingScreen />);
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should have full-screen layout classes', () => {
      render(<LoadingScreen />);
      const container = document.querySelector('.min-h-screen');
      expect(container).toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton', () => {
    it('should render default 3 lines', () => {
      render(<LoadingSkeleton />);
      const lines = document.querySelectorAll('.h-4');
      expect(lines.length).toBe(3);
    });

    it('should render specified number of lines', () => {
      render(<LoadingSkeleton lines={5} />);
      const lines = document.querySelectorAll('.h-4');
      expect(lines.length).toBe(5);
    });

    it('should have space-y-3 class for vertical spacing', () => {
      render(<LoadingSkeleton />);
      expect(document.querySelector('.space-y-3')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LoadingSkeleton className="custom-skeleton" />);
      expect(document.querySelector('.custom-skeleton')).toBeInTheDocument();
    });
  });

  describe('LoadingButton', () => {
    it('should render button with children when not loading', () => {
      render(<LoadingButton>Click Me</LoadingButton>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should show loading state with spinner and text', () => {
      render(<LoadingButton loading>Click Me</LoadingButton>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<LoadingButton loading>Click Me</LoadingButton>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should apply size classes correctly', () => {
      const { rerender } = render(<LoadingButton size="sm">Small</LoadingButton>);
      expect(screen.getByRole('button').className).toContain('px-3');

      rerender(<LoadingButton size="lg">Large</LoadingButton>);
      expect(screen.getByRole('button').className).toContain('px-6');
    });
  });

  describe('LoadingCard', () => {
    it('should render card skeleton', () => {
      render(<LoadingCard />);
      expect(document.querySelector('.bg-white')).toBeInTheDocument();
      expect(document.querySelector('.rounded-lg')).toBeInTheDocument();
    });

    it('should have avatar placeholder', () => {
      render(<LoadingCard />);
      const avatar = document.querySelector('.rounded-full');
      expect(avatar).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LoadingCard className="custom-card" />);
      expect(document.querySelector('.custom-card')).toBeInTheDocument();
    });
  });

  describe('LoadingChat', () => {
    it('should render 5 message placeholders', () => {
      render(<LoadingChat />);
      const messages = document.querySelectorAll('.rounded-2xl');
      expect(messages.length).toBe(5);
    });

    it('should have alternating left and right alignment', () => {
      render(<LoadingChat />);
      const leftAligned = document.querySelectorAll('.justify-start');
      const rightAligned = document.querySelectorAll('.justify-end');
      // 5 messages, alternating
      expect(leftAligned.length).toBe(3); // messages 0, 2, 4
      expect(rightAligned.length).toBe(2); // messages 1, 3
    });
  });

  describe('LoadingTable', () => {
    it('should render table with default rows and columns', () => {
      render(<LoadingTable />);
      // Default: 5 rows, 4 columns
      const rows = document.querySelectorAll('tbody tr');
      expect(rows.length).toBe(5);

      const cells = document.querySelectorAll('tbody td');
      expect(cells.length).toBe(20); // 5 rows * 4 columns
    });

    it('should render custom number of rows and columns', () => {
      render(<LoadingTable rows={3} columns={2} />);
      const rows = document.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);

      const cells = document.querySelectorAll('tbody td');
      expect(cells.length).toBe(6); // 3 rows * 2 columns
    });

    it('should have table header', () => {
      render(<LoadingTable />);
      const thead = document.querySelector('thead');
      expect(thead).toBeInTheDocument();
    });

    it('should have table body', () => {
      render(<LoadingTable />);
      const tbody = document.querySelector('tbody');
      expect(tbody).toBeInTheDocument();
    });
  });
});
