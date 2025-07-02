import { render, screen } from '@testing-library/react';
import { ResponsiveContainer } from '../responsive-container';

describe('ResponsiveContainer', () => {
  it('deve renderizar com configurações padrão', () => {
    render(
      <ResponsiveContainer data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('max-w-4xl');
    expect(container).toHaveClass('mx-auto');
    expect(container).toHaveClass('px-4');
    expect(container).toHaveClass('sm:px-6');
    expect(container).toHaveClass('lg:px-8');
  });

  it('deve aplicar tamanho small', () => {
    render(
      <ResponsiveContainer size="sm" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-2xl');
  });

  it('deve aplicar tamanho medium', () => {
    render(
      <ResponsiveContainer size="md" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-4xl');
  });

  it('deve aplicar tamanho large', () => {
    render(
      <ResponsiveContainer size="lg" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-6xl');
  });

  it('deve aplicar tamanho extra large', () => {
    render(
      <ResponsiveContainer size="xl" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-7xl');
  });

  it('deve aplicar tamanho full', () => {
    render(
      <ResponsiveContainer size="full" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-full');
  });

  it('deve aplicar padding small', () => {
    render(
      <ResponsiveContainer padding="sm" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('px-2');
    expect(container).toHaveClass('sm:px-4');
    expect(container).toHaveClass('lg:px-6');
  });

  it('deve aplicar padding medium', () => {
    render(
      <ResponsiveContainer padding="md" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('px-4');
    expect(container).toHaveClass('sm:px-6');
    expect(container).toHaveClass('lg:px-8');
  });

  it('deve aplicar padding large', () => {
    render(
      <ResponsiveContainer padding="lg" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('px-6');
    expect(container).toHaveClass('sm:px-8');
    expect(container).toHaveClass('lg:px-12');
  });

  it('deve aplicar padding none', () => {
    render(
      <ResponsiveContainer padding="none" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).not.toHaveClass('px-2');
    expect(container).not.toHaveClass('px-4');
    expect(container).not.toHaveClass('px-6');
    expect(container).not.toHaveClass('sm:px-4');
    expect(container).not.toHaveClass('sm:px-6');
    expect(container).not.toHaveClass('sm:px-8');
  });

  it('deve aplicar classes customizadas', () => {
    render(
      <ResponsiveContainer className="custom-class" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveClass('w-full'); // Deve manter as classes padrão
  });

  it('deve renderizar children corretamente', () => {
    render(
      <ResponsiveContainer>
        <div>Conteúdo filho 1</div>
        <div>Conteúdo filho 2</div>
      </ResponsiveContainer>
    );

    expect(screen.getByText('Conteúdo filho 1')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo filho 2')).toBeInTheDocument();
  });

  it('deve combinar size e padding customizados', () => {
    render(
      <ResponsiveContainer size="lg" padding="sm" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-6xl'); // size lg
    expect(container).toHaveClass('px-2'); // padding sm
    expect(container).toHaveClass('sm:px-4'); // padding sm
    expect(container).toHaveClass('lg:px-6'); // padding sm
  });

  it('deve funcionar sem props opcionais', () => {
    render(
      <ResponsiveContainer data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('mx-auto');
  });

  it('deve aceitar props HTML padrão', () => {
    render(
      <ResponsiveContainer id="test-id" role="main" data-testid="container">
        <div>Conteúdo</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveAttribute('id', 'test-id');
    expect(container).toHaveAttribute('role', 'main');
  });
});