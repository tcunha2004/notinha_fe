import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

export function ErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="page-container grid min-h-dvh place-content-center gap-4 text-center">
      <h1 className="text-title-2">{notFound ? 'Página não encontrada' : 'Algo deu errado'}</h1>
      <Link to="/" className="text-headline text-brand-green-dark underline">
        Voltar para o início
      </Link>
    </main>
  );
}
