import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { NotFoundStatus } from "@/components/NotFoundStatus";

const NotFound = () => (
  <main className="min-h-screen bg-background text-foreground">
    <NotFoundStatus />
    <Nav useHomeSectionLinks />
    <div className="container-x py-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
        <ArrowLeft className="h-4 w-4" />
        Voltar para o início
      </Link>
      <h1 className="mt-10 editorial text-5xl">Página não encontrada</h1>
      <p className="mt-4 max-w-lg text-muted-foreground">
        O endereço pode estar errado ou esta página não existe mais.
      </p>
    </div>
    <Footer useHomeSectionLinks />
  </main>
);

export default NotFound;
