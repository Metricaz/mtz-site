# Metricaz — site

Site institucional da Metricaz: frontend em **React + Vite + Tailwind** (`src/`), renderizado no servidor (SSR) por um servidor Node (`server.js`), e backend em **Django + Django REST Framework** (`backend/`).

- Todo o conteúdo do site (textos, números, listas, imagens, serviços, cases, blog…) vem do banco de dados e é editado no **admin do Django** (`/admin/`).
- O **dashboard** (`/dashboard`) é só leitura: mostra o conteúdo, as mensagens de contato e os cliques de WhatsApp.
- Login do dashboard e do admin: autenticação padrão do Django (usuário e senha).

## Estrutura

```
.
├── src/                     # frontend React (Vite)
│   ├── entry-client.tsx     # navegador: hidrata o HTML que veio do servidor
│   └── entry-server.tsx     # servidor: renderiza a página com os dados do Django
├── server.js                # servidor Node (SSR) + proxy para o Django
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
└── vite.config.ts
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

### 2. Frontend (Node + Vite)

Em outro terminal, na raiz do projeto:

```bash
npm ci
npm run dev                                  # http://localhost:8080
```

O `npm run dev` roda o `server.js` com o Vite embutido (recarrega ao salvar). Cada página é renderizada no servidor, já com o conteúdo do Django, e o React assume no navegador.

O `server.js` repassa para o Django as rotas `/api`, `/admin`, `/static`, `/media`, `/dashboard/login` e `/dashboard/logout`, então o site, o login e o admin funcionam todos por `http://localhost:8080`. Variáveis: `PORT` (padrão `8080`) e `DJANGO_URL` (padrão `http://127.0.0.1:8000`), ex.: `DJANGO_URL=http://127.0.0.1:8001 npm run dev`.

> O Django precisa estar de pé: sem ele as páginas saem vazias. O servidor Node chama o Django por `127.0.0.1`, que precisa estar no `DJANGO_ALLOWED_HOSTS`.

Para testar o build de produção na máquina:

```bash
npm run build                                # gera dist/client (navegador) e dist/server (SSR)
npm start                                    # http://localhost:8080, a partir do build
```

### Endereços

| Endereço | O que é |
|---|---|
| `http://localhost:8080/` | site |
| `http://localhost:8080/admin/` | admin do Django (edição de todo o conteúdo) |
| `http://localhost:8080/dashboard` | dashboard (visualização e edição do conteúdo de serviços, cases e posts, com colar formatado e envio de imagens; exige usuário **staff**) |
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
npm run build
```

## Deploy (UAT e produção)

Servidor próprio, sem Docker. Os arquivos ficam em `deploy-assets/`:

| Arquivo | Vai para | O que é |
|---|---|---|
| `sites-available/mtz-site.conf` | `/etc/nginx/sites-available/` | nginx: `/api`, `/admin` e login/logout → Django; `/static`, `/media`, `/assets` → disco; o resto → Node |
| `systemd/mtz-site-django.service` | `/etc/systemd/system/` | Django (gunicorn) em `127.0.0.1:8101` |
| `systemd/mtz-site-web.service` | `/etc/systemd/system/` | páginas (Node, SSR) em `127.0.0.1:8100` |
| `cron.d/mtz-site` | `/etc/cron.d/` | resumo de e-mail de hora em hora |
| `install.sh` | — | copia os arquivos acima para o sistema e reinicia/recarrega |
| `deploy.sh` | — | atualização (pull, dependências, migrate, collectstatic, build, `install.sh`) |

O projeto fica em `/local/dev/mtz-site`, e tudo roda com o usuário `www-data`. UAT: `https://mtz-site.dev.i.metricaz.com`, com SQLite. O mesmo roteiro vale para produção; muda o `.env` (e o `server_name`/certificado do nginx).

### Primeira instalação (como root)

**1. Requisitos (Debian 13).** O Django 6.1 exige Python ≥ 3.12; o Debian 13 já vem com o 3.13.

```bash
apt install -y python3 python3-venv git
```

Node: ≥ 20 (`node -v`).

**2. Código.** O repositório é privado: se o `www-data` ainda não tem chave, gere uma e cadastre a pública em GitHub → repositório → Settings → Deploy keys (só leitura). O home do `www-data` é `/var/www`; ele também guarda os caches do pip e do npm.

```bash
install -d -o www-data -g www-data -m 700 /var/www/.ssh
install -d -o www-data -g www-data /var/www/.cache /var/www/.npm
sudo -u www-data -H ssh-keygen -t ed25519 -N "" -f /var/www/.ssh/id_ed25519
cat /var/www/.ssh/id_ed25519.pub              # → Deploy key no GitHub

mkdir -p /local/dev/mtz-site && chown www-data: /local/dev/mtz-site
sudo -u www-data -H git clone -b django-backend git@github.com:Metricaz/mtz-site.git /local/dev/mtz-site
```

**3. Backend.**

```bash
cd /local/dev/mtz-site/backend
sudo -u www-data -H python3 -m venv env
sudo -u www-data -H env/bin/pip install -r requirements
sudo -u www-data -H cp .env.example .env && chmod 600 .env
```

No `.env` do servidor:

- `DJANGO_SECRET_KEY`: uma nova (comando na seção de desenvolvimento)
- `DJANGO_DEBUG=false`
- `DJANGO_ALLOWED_HOSTS=mtz-site.dev.i.metricaz.com,127.0.0.1` (o `127.0.0.1` é o servidor Node chamando o Django)
- `DJANGO_CSRF_TRUSTED_ORIGINS=https://mtz-site.dev.i.metricaz.com`
- E-mail: no UAT, `EMAIL_HOST` vazio ou `CONTACT_DIGEST_TO` apontando para quem está testando, para dado de teste não chegar ao comercial.

```bash
sudo -u www-data -H env/bin/python manage.py migrate
sudo -u www-data -H env/bin/python manage.py loaddata initial_content
sudo -u www-data -H cp -R content/fixtures/media/. media/
sudo -u www-data -H env/bin/python manage.py collectstatic --noinput
sudo -u www-data -H env/bin/python manage.py createsuperuser
```

**4. Frontend.**

```bash
cd /local/dev/mtz-site
sudo -u www-data -H npm ci
sudo -u www-data -H npm run build
```

**5. Serviços, nginx e cron.** Confira antes o caminho do certificado `*.dev.i.metricaz.com` no `mtz-site.conf` (`grep -h ssl_certificate /etc/nginx/sites-enabled/*`).

```bash
/local/dev/mtz-site/deploy-assets/install.sh
```

O `install.sh` copia os serviços systemd, o site do nginx (com o link em `sites-enabled`) e o cron, habilita e reinicia os serviços e recarrega o nginx (depois do `nginx -t`). Pode ser rodado de novo; o `deploy.sh` também o roda.

### Atualizar

```bash
sudo /local/dev/mtz-site/deploy-assets/deploy.sh
```

Logs: `journalctl -u mtz-site-django -f` e `journalctl -u mtz-site-web -f`.
