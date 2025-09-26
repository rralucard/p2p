import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { 
  LoadingIndicator, 
  Skeleton, 
  VenueCardSkeleton, 
  LocationInputSkeleton, 
  VenueDetailSkeleton, 
  MapSkeleton 
} from '../LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders spinner by default', () => {
    render(<LoadingIndicator />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', '加载中');
  });

  it('renders with text', () => {
    render(<LoadingIndicator text="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders dots loader', () => {
    render(<LoadingIndicator type="dots" />);
    
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
  });

  it('renders pulse loader', () => {
    render(<LoadingIndicator type="pulse" />);
    
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
  });

  it('renders with overlay', () => {
    render(<LoadingIndicator overlay />);
    
    // Should render fixed positioned overlay
    const overlay = screen.getByRole('status').closest('.fixed');
    expect(overlay).toBeInTheDocument();
  });

  it('applies different sizes', () => {
    const { rerender } = render(<LoadingIndicator size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4');

    rerender(<LoadingIndicator size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8');
  });
});

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-gray-300', 'animate-pulse');
  });

  it('renders with custom dimensions', () => {
    render(<Skeleton width="200px" height="50px" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '50px',
    });
  });

  it('renders rounded skeleton', () => {
    render(<Skeleton rounded />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders without animation', () => {
    render(<Skeleton animate={false} />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).not.toHaveClass('animate-pulse');
  });
});

describe('VenueCardSkeleton', () => {
  it('renders venue card skeleton structure', () => {
    render(<VenueCardSkeleton />);
    
    // Should have image skeleton and content skeletons
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(1);
  });
});

describe('LocationInputSkeleton', () => {
  it('renders location input skeleton structure', () => {
    render(<LocationInputSkeleton />);
    
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBe(2); // Label and input
  });
});

describe('VenueDetailSkeleton', () => {
  it('renders venue detail skeleton structure', () => {
    render(<VenueDetailSkeleton />);
    
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(5);
  });
});

describe('MapSkeleton', () => {
  it('renders map skeleton with default height', () => {
    render(<MapSkeleton />);
    
    const mapSkeleton = screen.getByText('地图加载中...');
    expect(mapSkeleton).toBeInTheDocument();
  });

  it('renders map skeleton with custom height', () => {
    render(<MapSkeleton height="400px" />);
    
    const container = screen.getByText('地图加载中...').closest('div');
    expect(container).toHaveStyle({ height: '400px' });
  });
});