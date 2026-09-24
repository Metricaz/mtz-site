from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models

from .sanitize import sanitize_html


class OrderedModel(models.Model):
    """Base for everything editable in the dashboard: manual ordering, on/off switch and authorship."""

    order_position = models.IntegerField("posição", default=0, help_text="Menor aparece primeiro.")
    is_active = models.BooleanField("ativo", default=True, help_text="Desmarcado = não aparece no site.")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="criado por",
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    created_at = models.DateTimeField("criado em", auto_now_add=True)
    updated_at = models.DateTimeField("atualizado em", auto_now=True)

    class Meta:
        abstract = True
        ordering = ["order_position", "created_at"]


class SingletonModel(models.Model):
    """A table with exactly one row (pk=1). Use `Model.load()` to read it."""

    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    updated_at = models.DateTimeField("atualizado em", auto_now=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


# --- Conteúdo -----------------------------------------------------------------------------------

class Sector(OrderedModel):
    name = models.CharField("nome", max_length=255)

    class Meta(OrderedModel.Meta):
        verbose_name = "setor"
        verbose_name_plural = "setores"

    def __str__(self):
        return self.name


class Company(OrderedModel):
    name = models.CharField("nome", max_length=255)
    logo = models.ImageField("logo", upload_to="companies/", blank=True)
    logo_alt = models.CharField("texto alternativo do logo", max_length=255, blank=True)
    website_url = models.URLField("site", blank=True)

    class Meta(OrderedModel.Meta):
        verbose_name = "empresa"
        verbose_name_plural = "empresas"

    def __str__(self):
        return self.name


class TeamMember(OrderedModel):
    name = models.CharField("nome", max_length=255)
    role = models.CharField("cargo", max_length=255)
    bio = models.TextField("bio", blank=True)
    photo = models.ImageField("foto", upload_to="team/", blank=True)
    photo_alt = models.CharField("texto alternativo da foto", max_length=255, blank=True)
    show_on_home = models.BooleanField("aparece na home", default=True, help_text="Seção Time da home.")
    show_on_about = models.BooleanField(
        "aparece no Quem Somos", default=False, help_text='Seção "Heads da operação" do Quem Somos.'
    )

    class Meta(OrderedModel.Meta):
        verbose_name = "membro do time"
        verbose_name_plural = "time"

    def __str__(self):
        return f"{self.name} ({self.role})"


class Testimonial(OrderedModel):
    name = models.CharField("nome", max_length=255)
    role = models.CharField("cargo", max_length=255)
    company = models.CharField("empresa", max_length=255)
    text = models.TextField("depoimento")
    show_in_client_panel = models.BooleanField(
        "aparece no painel Cliente", default=False, help_text='Carrossel laranja "// Cliente" da home.'
    )
    show_in_testimonials = models.BooleanField(
        "aparece em Depoimentos", default=True, help_text="Seção Depoimentos da home."
    )
    show_on_about = models.BooleanField(
        "destaque do Quem Somos",
        default=False,
        help_text="O Quem Somos mostra um depoimento só: o primeiro marcado, por posição.",
    )

    class Meta(OrderedModel.Meta):
        verbose_name = "depoimento"
        verbose_name_plural = "depoimentos"

    def __str__(self):
        return f"{self.name} · {self.company}"


# Every icon a model can use; same values the frontend knows how to draw (src/lib/service-icons.ts).
ICONS = [
    ("seo", "SEO"),
    ("cro", "CRO & Testes A/B"),
    ("analytics", "Digital Analytics"),
    ("development", "Desenvolvimento"),
    ("strategy", "Estratégia"),
    ("automation", "Automação"),
    ("dashboards", "Dashboards"),
    ("data-quality", "Qualidade de dados"),
    ("tracking", "Tagueamento"),
    ("performance", "Performance"),
    ("ops", "Operações"),
    ("engineering", "Engenharia"),
    ("testing", "Testes"),
    ("growth", "Growth"),
    ("signal", "Sinal & Métrica"),
    ("compass", "Bússola"),
    ("target", "Alvo"),
    ("radio", "Sinal de rádio"),
    ("users", "Pessoas"),
    ("briefcase", "Maleta"),
    ("trending-up", "Tendência de alta"),
]

RICH_TEXT_HELP = (
    'HTML. Imagens são referenciadas por <img data-image-id="ID"> (ID de uma Imagem de conteúdo). '
    "Scripts, estilos e atributos fora da lista permitida são removidos ao salvar."
)


class SanitizedContentMixin:
    """content_html is sanitized on every save (API, admin, shell), since the site renders it as raw HTML."""

    def save(self, *args, **kwargs):
        self.content_html = sanitize_html(self.content_html)
        super().save(*args, **kwargs)


class RichTextModel(SanitizedContentMixin, OrderedModel):
    class Meta(OrderedModel.Meta):
        abstract = True


class Service(RichTextModel):
    title = models.CharField("título", max_length=255)
    slug = models.SlugField("slug", max_length=255, unique=True, help_text="Endereço: /servicos/<slug>")
    icon_name = models.CharField("ícone", max_length=40, choices=ICONS)
    excerpt = models.TextField("resumo")
    content_html = models.TextField("conteúdo", help_text=RICH_TEXT_HELP)

    class Meta(RichTextModel.Meta):
        verbose_name = "serviço"
        verbose_name_plural = "serviços"

    def __str__(self):
        return self.title


class Case(RichTextModel):
    title = models.CharField("título", max_length=255)
    slug = models.SlugField("slug", max_length=255, unique=True, help_text="Endereço: /cases/<slug>")
    tag = models.CharField("tag", max_length=120)
    excerpt = models.TextField("resumo")
    kpi_value = models.CharField("KPI — valor", max_length=60, help_text='Ex.: "+40%"')
    kpi_label = models.CharField("KPI — rótulo", max_length=120, help_text='Ex.: "conversão"')
    client_name = models.CharField("cliente", max_length=255, blank=True)
    service_stack = models.CharField("escopo", max_length=255, blank=True)
    featured_image = models.ImageField("imagem de destaque", upload_to="cases/")
    featured_image_alt = models.CharField("texto alternativo da imagem", max_length=255, blank=True)
    content_html = models.TextField("conteúdo", help_text=RICH_TEXT_HELP)

    class Meta(RichTextModel.Meta):
        verbose_name = "case"
        verbose_name_plural = "cases"

    def __str__(self):
        return self.title


class MethodStep(OrderedModel):
    """Seção Método da home. O número exibido (01, 02…) é a ordem por posição."""

    title = models.CharField("título", max_length=120)
    text = models.TextField("texto")
    icon_name = models.CharField("ícone", max_length=40, choices=ICONS)
    tags = models.CharField("tags", max_length=255, blank=True, help_text="Separe com vírgula. Ex.: Stack audit, Data quality")

    class Meta(OrderedModel.Meta):
        verbose_name = "passo do método"
        verbose_name_plural = "passos do método"

    def __str__(self):
        return self.title


class EngagementModel(OrderedModel):
    """Seção "Modelos de contratação" da home. O número exibido é a ordem por posição."""

    title = models.CharField("título", max_length=120)
    text = models.TextField("texto")
    icon_name = models.CharField("ícone", max_length=40, choices=ICONS)

    class Meta(OrderedModel.Meta):
        verbose_name = "modelo de contratação"
        verbose_name_plural = "modelos de contratação"

    def __str__(self):
        return self.title


class Capability(OrderedModel):
    """Faixa laranja de capacidades logo abaixo do topo da home."""

    label = models.CharField("rótulo", max_length=80)
    icon_name = models.CharField("ícone", max_length=40, choices=ICONS)

    class Meta(OrderedModel.Meta):
        verbose_name = "capacidade"
        verbose_name_plural = "capacidades"

    def __str__(self):
        return self.label


class AboutPillar(OrderedModel):
    """Cards de "O que fazemos" no Quem Somos."""

    tag = models.CharField("tag", max_length=60)
    title = models.CharField("título", max_length=120)
    text = models.TextField("texto")
    image = models.ImageField("imagem", upload_to="about/")
    image_alt = models.CharField("texto alternativo da imagem", max_length=255, blank=True)

    class Meta(OrderedModel.Meta):
        verbose_name = "pilar do Quem Somos"
        verbose_name_plural = "pilares do Quem Somos"

    def __str__(self):
        return self.title


class AboutHighlight(OrderedModel):
    """Diferenciais de "Por que escolher a Metricaz" no Quem Somos."""

    title = models.CharField("título", max_length=120)
    text = models.TextField("texto")

    class Meta(OrderedModel.Meta):
        verbose_name = "diferencial do Quem Somos"
        verbose_name_plural = "diferenciais do Quem Somos"

    def __str__(self):
        return self.title


class SocialLink(OrderedModel):
    """Links do rodapé (redes sociais, privacidade)."""

    label = models.CharField("rótulo", max_length=60)
    url = models.CharField("link", max_length=500, help_text="URL completa ou caminho do site (ex.: /privacidade).")

    class Meta(OrderedModel.Meta):
        verbose_name = "link do rodapé"
        verbose_name_plural = "links do rodapé"

    def __str__(self):
        return self.label


# --- Blog ---------------------------------------------------------------------------------------

class Author(models.Model):
    name = models.CharField("nome", max_length=120)
    mini_bio = models.TextField("minibio", blank=True)
    created_at = models.DateTimeField("criado em", auto_now_add=True)
    updated_at = models.DateTimeField("atualizado em", auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "autor"
        verbose_name_plural = "autores"

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField("nome", max_length=60, unique=True)
    slug = models.SlugField("slug", max_length=80, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "tag"
        verbose_name_plural = "tags"

    def __str__(self):
        return self.name


class Post(SanitizedContentMixin, models.Model):
    """Post do blog: /blog/<slug>. Lista do mais recente para o mais antigo (data de publicação)."""

    title = models.CharField("título", max_length=255)
    slug = models.SlugField("slug", max_length=255, unique=True, help_text="Endereço: /blog/<slug>")
    subtitle = models.CharField("subtítulo", max_length=255, blank=True)
    author = models.ForeignKey(Author, verbose_name="autor", null=True, blank=True, on_delete=models.SET_NULL, related_name="posts")
    tag = models.ForeignKey(Tag, verbose_name="tag", null=True, blank=True, on_delete=models.SET_NULL, related_name="posts")
    featured_image = models.ImageField("imagem principal", upload_to="blog/")
    featured_image_alt = models.CharField("texto alternativo da imagem", max_length=255, blank=True)
    content_html = models.TextField("conteúdo", help_text=RICH_TEXT_HELP)
    published_at = models.DateField("data de publicação")
    is_active = models.BooleanField("publicado", default=True, help_text="Desmarcado = não aparece no site.")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="criado por",
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    created_at = models.DateTimeField("criado em", auto_now_add=True)
    updated_at = models.DateTimeField("atualizado em", auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        verbose_name = "post"
        verbose_name_plural = "posts"

    def __str__(self):
        return self.title


class ContentImage(models.Model):
    """Image uploaded from the rich-text editor, referenced in HTML as <img data-image-id="ID">."""

    # width/height are filled in by Django on upload; they only tell the browser the aspect ratio
    # (the displayed size always comes from the CSS of the block).
    image = models.ImageField("imagem", upload_to="content/", width_field="width", height_field="height")
    width = models.PositiveIntegerField("largura", null=True, blank=True, editable=False)
    height = models.PositiveIntegerField("altura", null=True, blank=True, editable=False)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="enviada por",
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    uploaded_at = models.DateTimeField("enviada em", auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "imagem de conteúdo"
        verbose_name_plural = "imagens de conteúdo"

    def __str__(self):
        return f"#{self.pk} {self.image.name}"


class CompanyAddress(OrderedModel):
    label = models.CharField("rótulo", max_length=120, help_text='Ex.: "São Paulo"')
    street = models.CharField("logradouro e número", max_length=255)
    complement = models.CharField("complemento", max_length=120, blank=True)
    district = models.CharField("bairro", max_length=120, blank=True)
    city = models.CharField("cidade", max_length=120)
    state = models.CharField("estado", max_length=60)
    postal_code = models.CharField("CEP / ZIP", max_length=20, blank=True)
    country = models.CharField("país", max_length=60)
    phone = models.CharField("telefone", max_length=40, blank=True)
    hours = models.CharField("horário", max_length=120, blank=True)
    map_url = models.URLField("mapa (URL de incorporação)", max_length=500, blank=True)

    class Meta(OrderedModel.Meta):
        verbose_name = "endereço"
        verbose_name_plural = "endereços"

    def __str__(self):
        return f"{self.label} — {self.street}"


OPTION_KEY = RegexValidator(r"^[a-z0-9_]+(\.[a-z0-9_]+)*$", "Use o formato secao.campo (minúsculas, números, _ e .).")

OPTION_VALUE_HELP = "Texto: *asteriscos* marcam o destaque (laranja/itálico) e Enter quebra a linha. Números: só o número (ex.: 312)."


class SiteOption(models.Model):
    """Loose site text/number read by key in the templates (wp_options style). Empty value = not shown."""

    key = models.CharField("chave", max_length=120, unique=True, validators=[OPTION_KEY])
    label = models.CharField("rótulo", max_length=255, blank=True, help_text="Texto que acompanha o valor (ex.: \"Receita orgânica média\").")
    value = models.TextField("valor", blank=True, help_text=OPTION_VALUE_HELP)
    description = models.CharField("descrição", max_length=255, blank=True, help_text="O que é e onde aparece.")
    updated_at = models.DateTimeField("atualizado em", auto_now=True)

    class Meta:
        ordering = ["key"]
        verbose_name = "opção do site"
        verbose_name_plural = "opções do site"

    def __str__(self):
        return self.key


class SiteImage(models.Model):
    """Single site image read by key in the templates (like SiteOption, for images)."""

    key = models.CharField("chave", max_length=120, unique=True, validators=[OPTION_KEY])
    image = models.ImageField("imagem", upload_to="site/")
    alt = models.CharField("texto alternativo", max_length=255, blank=True)
    description = models.CharField("descrição", max_length=255, blank=True, help_text="O que é e onde aparece.")
    updated_at = models.DateTimeField("atualizado em", auto_now=True)

    class Meta:
        ordering = ["key"]
        verbose_name = "imagem do site"
        verbose_name_plural = "imagens do site"

    def __str__(self):
        return self.key


# --- Configurações (linha única) --------------------------------------------------------------

class WhatsAppSettings(SingletonModel):
    number = models.CharField("número", max_length=30, blank=True, help_text="Só dígitos, com DDI. Ex.: 5511999999999")
    enabled = models.BooleanField("botão ativo", default=True)
    message = models.TextField("mensagem inicial", blank=True)

    class Meta:
        verbose_name = "WhatsApp"
        verbose_name_plural = "WhatsApp"

    def __str__(self):
        return "WhatsApp"


# --- Recebido do visitante ----------------------------------------------------------------------

class ContactSubmission(models.Model):
    class Status(models.TextChoices):
        QUEUED = "queued", "Na fila"
        SENT = "sent", "Enviado"
        FAILED = "failed", "Falhou"

    name = models.CharField("nome", max_length=255)
    company = models.CharField("empresa", max_length=255, blank=True)
    email = models.EmailField("e-mail", max_length=255)
    phone = models.CharField("telefone", max_length=50, blank=True)
    message = models.TextField("mensagem")
    source_page = models.CharField("página de origem", max_length=500, blank=True)
    source_context = models.CharField("contexto de origem", max_length=120, blank=True)
    status = models.CharField("status do envio", max_length=10, choices=Status, default=Status.QUEUED)
    error_message = models.TextField("erro", blank=True)
    payload = models.JSONField("dados recebidos", default=dict, blank=True)
    created_at = models.DateTimeField("recebida em", auto_now_add=True)
    updated_at = models.DateTimeField("atualizada em", auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "mensagem de contato"
        verbose_name_plural = "mensagens de contato"

    def __str__(self):
        return f"{self.name} <{self.email}>"


class WhatsAppClick(models.Model):
    page_path = models.CharField("página", max_length=500)
    button_context = models.CharField("botão", max_length=120)
    target_number = models.CharField("número", max_length=30, blank=True)
    message_text = models.TextField("mensagem", blank=True)
    clicked_at = models.DateTimeField("clicado em", auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-clicked_at"]
        verbose_name = "clique no WhatsApp"
        verbose_name_plural = "cliques no WhatsApp"


class NewsletterSubscriber(models.Model):
    email = models.EmailField("e-mail", unique=True)
    source_page = models.CharField("página de origem", max_length=500, blank=True)
    created_at = models.DateTimeField("inscrito em", auto_now_add=True)
    notified_at = models.DateTimeField(
        "enviado no resumo em", null=True, blank=True, editable=False,
        help_text="Preenchido pelo resumo por e-mail (send_contact_digest). Vazio = ainda não enviado.",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "inscrito na newsletter"
        verbose_name_plural = "inscritos na newsletter"

    def __str__(self):
        return self.email


class Lead(models.Model):
    email = models.EmailField("e-mail")
    source_page = models.CharField("página de origem", max_length=500, blank=True)
    created_at = models.DateTimeField("recebido em", auto_now_add=True)
    notified_at = models.DateTimeField(
        "enviado no resumo em", null=True, blank=True, editable=False,
        help_text="Preenchido pelo resumo por e-mail (send_contact_digest). Vazio = ainda não enviado.",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "lead"
        verbose_name_plural = "leads"

    def __str__(self):
        return self.email
