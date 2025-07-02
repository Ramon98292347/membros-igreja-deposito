import { render, screen } from '@testing-library/react';
import { ResponsiveGrid } from '../responsive-grid';

describe('ResponsiveGrid', () => {
  it('deve renderizar com classes padrão', () => {
    render(
      <ResponsiveGrid data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('gap-4');
  });

  it('deve aplicar número de colunas customizado', () => {
    render(
      <ResponsiveGrid cols={{ default: 2, md: 3, lg: 4 }} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-3');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('deve aplicar gap customizado', () => {
    render(
      <ResponsiveGrid gap="lg" data-testid="grid">
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('gap-6');
  });

  it('deve aplicar classes customizadas', () => {
    render(
      <ResponsiveGrid className="custom-class" data-testid="grid">
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('custom-class');
    expect(grid).toHaveClass('grid'); // Deve manter as classes padrão
  });

  it('deve renderizar children corretamente', () => {
    render(
      <ResponsiveGrid>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ResponsiveGrid>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('deve aplicar todas as configurações de colunas responsivas', () => {
    render(
      <ResponsiveGrid 
        cols={{ 
          default: 1, 
          sm: 2, 
          md: 3, 
          lg: 4, 
          xl: 5, 
          '2xl': 6 
        }} 
        data-testid="grid"
      >
        <div>Item</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-3');
    expect(grid).toHaveClass('lg:grid-cols-4');
    expect(grid).toHaveClass('xl:grid-cols-5');
    expect(grid).toHaveClass('2xl:grid-cols-6');
  });

  it('deve aplicar diferentes tamanhos de gap', () => {
    const gaps = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };

    Object.entries(gaps).forEach(([size, expectedClass]) => {
      const { unmount } = render(
        <ResponsiveGrid gap={size as any} data-testid={`grid-${size}`}>
          <div>Item</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId(`grid-${size}`);
      expect(grid).toHaveClass(expectedClass);
      unmount();
    });
  });

  it('deve funcionar sem props opcionais', () => {
    render(
      <ResponsiveGrid data-testid="grid">
        <div>Item</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid');
  });
});