# Metricaz — site

Site institucional da Metricaz: frontend em **React + Vite + Tailwind** (`src/`) e backend em **Django + Django REST Framework** (`backend/`).

- Todo o conteúdo do site (textos, números, listas, imagens, serviços, cases, blog…) vem do banco de dados e é editado no **admin do Django** (`/admin/`).
- O **dashboard** (`/dashboard`) é só leitura: mostra o conteúdo, as mensagens de contato e os cliques de WhatsApp.
- Login do dashboard e do admin: autenticação padrão do Django (usuário e senha).

## Estrutura

```
.
├── src/                     # frontend React (Vite)
├── public/
├── backend/
│   ├── manage.py
│   ├── requirements         # dependências Python
│   ├── .env.example         # modelo de configuração (copiar para .env)
│   ├── backend/             # settings, urls
│   └── content/             # app: models, admin, API, e-mail, testes
│       ├── fixtures/
│       │   ├── initial_content.json   # conteúdo inicial do site
│       │   └── media/                 # imagens usadas pela fixture
│       ├── management/commands/send_contact_digest.py
│       └── templates/
└── vite.config.ts           # dev server na porta 8080, com proxy para o Django
```

## Requisitos

- Python 3.13
- Node.js + npm

## Ambiente de desenvolvimento

### 1. Backend (Django)

```bash
cd backend
python3 -m venv env
env/bin/pip install -r requirements

cp .env.example .env
```

Edite o `backend/.env`:

- `DJANGO_SECRET_KEY`: gere uma com
  `env/bin/python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `DJANGO_DEBUG=true`
- `DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1`
- `DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080`
- Deixe `EMAIL_HOST` **vazio** em desenvolvimento: os e-mails só são impressos no terminal (com ele preenchido, os e-mails são enviados de verdade).

Crie o banco, carregue o conteúdo inicial e crie um usuário:

```bash
env/bin/python manage.py migrate
env/bin/python manage.py loaddata initial_content
cp -R content/fixtures/media/. media/        # imagens da fixture — não esqueça este passo
env/bin/python manage.py createsuperuser
env/bin/python manage.py runserver           # http://127.0.0.1:8000
```

> O `loaddata` pode ser repetido: os registros mantêm os mesmos IDs e são atualizados, não duplicados.
> Sem o `cp` das imagens, os textos aparecem mas as imagens (Quem Somos, case, blog) ficam quebradas.

### 2. Frontend (Vite)

Em outro terminal, na raiz do projeto:

```bash
npm ci
npm run dev                                  # http://localhost:8080
```

O Vite repassa para o Django (`127.0.0.1:8000`) as rotas `/api`, `/admin`, `/static`, `/media`, `/dashboard/login` e `/dashboard/logout`, então o site, o login e o admin funcionam todos por `http://localhost:8080`. Para apontar para outro endereço do Django: `DJANGO_DEV_SERVER=http://127.0.0.1:8001 npm run dev`.

### Endereços

| Endereço | O que é |
|---|---|
| `http://localhost:8080/` | site |
| `http://localhost:8080/admin/` | admin do Django (edição de todo o conteúdo) |
| `http://localhost:8080/dashboard` | dashboard (só leitura; exige usuário **staff**) |
| `http://localhost:8080/api/` | API (DRF) |

## Conteúdo

- **Regra geral:** o que não está no banco não aparece. Seção sem dados não é renderizada — não existe conteúdo "de reserva" no código. Só interface fica no código (menu, botões, rótulos de formulário, mensagens de sistema).
- **Opções do site** (admin → *Opções do site*): textos e números soltos, por chave (`hero.title`, `contact.email`, `marcasatendidas`…).
  - Em textos, `*asteriscos*` marcam o destaque (laranja/itálico) e Enter quebra a linha.
  - Em números, o valor é só o número (ex.: `312`); o formato (`+312%`) é definido por cada seção e o texto que acompanha vem do **rótulo**.
  - A mesma chave é usada em todos os lugares onde o valor aparece.
- **Imagens do site** (admin → *Imagens do site*): imagens avulsas por chave (ex.: `about.why_image`).
- **Conteúdo rico** (serviços, cases, posts): HTML. Imagens do conteúdo são enviadas em *Imagens de conteúdo* e referenciadas por `<img data-image-id="ID">`; scripts, estilos e atributos fora da lista permitida são removidos ao salvar.
- **Posição e ativo**: a maioria dos itens tem *posição* (menor aparece primeiro) e *ativo* (desmarcado = não aparece no site).
- A fixture `initial_content` traz o conteúdo atual do site, um case de exemplo e um post de exemplo (com autor e tag).

## E-mail: resumo de contatos

As mensagens do formulário de contato, os leads ("Começar →") e as inscrições na newsletter são gravados no banco. Um comando envia **um único e-mail com o resumo** de tudo o que chegou desde o último envio:

```bash
env/bin/python manage.py send_contact_digest --dry-run   # mostra o que seria enviado
env/bin/python manage.py send_contact_digest             # envia e marca como enviado
```

- Nada novo = nada é enviado. Se o envio falhar, nada é marcado e tudo vai no próximo.
- Remetente: `DEFAULT_FROM_EMAIL` (precisa ser um remetente verificado no relay). Destinatário: `CONTACT_DIGEST_TO`.
- Relay SMTP (ex.: SendGrid) pelas variáveis `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` no `.env`. Para o SendGrid: `EMAIL_HOST=smtp.sendgrid.net`, `EMAIL_HOST_USER=apikey`, `EMAIL_HOST_PASSWORD=<chave>`.

Cron de hora em hora (ajuste o caminho):

```cron
0 * * * *  cd /caminho/do/projeto/backend && env/bin/python manage.py send_contact_digest
```

## Testes

```bash
cd backend && env/bin/python manage.py test content    # backend (e-mails ficam em memória, nada é enviado)
npx tsc -p tsconfig.app.json --noEmit                   # tipos do frontend
npm run lint
npm test
npm run build
```

> O `npm run lint` acusa 3 erros que já existiam no código original (componentes shadcn em `src/components/ui/` e um `require` no `tailwind.config.ts`).

## Deploy (UAT e produção)

A fazer: VPS com nginx + gunicorn + systemd + PostgreSQL, Django servindo o build do React (com título e descrição de SEO vindos do banco) e o cron do resumo de e-mail. O mesmo roteiro vale para UAT (homologação) e produção; muda só o `.env` de cada servidor.
