import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Button } from '../components/ui/Button';

/** Short title + one sentence + one action. */
export function ErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="page-container flex min-h-dvh flex-col justify-center gap-2 px-5">
      <h1 className="texto-titulo-1">{notFound ? 'Página não encontrada' : 'Algo deu errado'}</h1>
      <p className="texto-corpo text-texto-secundario">
        {notFound
          ? 'Esse endereço não existe ou a compra foi excluída.'
          : 'Confira sua conexão e tente de novo daqui a pouco.'}
      </p>
      <Button to="/" size="medio" className="mt-4 self-start">
        Voltar para o início
      </Button>
    </main>
  );
}
