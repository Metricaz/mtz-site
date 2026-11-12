from django.db import migrations, models
from django.utils.text import slugify


def fill_author_slugs(apps, schema_editor):
    """Existing authors get a slug from their name (-2, -3... if two share a name)."""
    Author = apps.get_model("content", "Author")
    used = set()
    for author in Author.objects.order_by("pk"):
        base = slugify(author.name)[:130] or "autor"
        slug, n = base, 2
        while slug in used:
            slug, n = f"{base}-{n}", n + 1
        used.add(slug)
        author.slug = slug
        author.save(update_fields=["slug"])


class Migration(migrations.Migration):
    dependencies = [
        ("content", "0018_faq_related_links_reviewed_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="author",
            name="slug",
            field=models.SlugField(blank=True, max_length=140, null=True, verbose_name="slug"),
        ),
        migrations.RunPython(fill_author_slugs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="author",
            name="slug",
            field=models.SlugField(
                blank=True,
                help_text="Endereço: /autor/<slug>. Vazio = gerado do nome.",
                max_length=140,
                unique=True,
                verbose_name="slug",
            ),
        ),
        migrations.AddField(
            model_name="author",
            name="role",
            field=models.CharField(blank=True, help_text="Ex.: Head de SEO na Metricaz.", max_length=120, verbose_name="cargo"),
        ),
        migrations.AddField(
            model_name="author",
            name="photo",
            field=models.ImageField(blank=True, help_text="Quadrada, de preferência.", upload_to="authors/", verbose_name="foto"),
        ),
        migrations.AddField(
            model_name="author",
            name="linkedin_url",
            field=models.URLField(
                blank=True,
                help_text="Endereço do perfil. Ajuda o Google e as IAs a reconhecer o autor.",
                verbose_name="LinkedIn",
            ),
        ),
        migrations.AddField(
            model_name="tag",
            name="description",
            field=models.TextField(
                blank=True, help_text="Texto de abertura da página da categoria (2 a 3 linhas).", verbose_name="descrição"
            ),
        ),
        migrations.AlterField(
            model_name="tag",
            name="slug",
            field=models.SlugField(help_text="Endereço: /blog/categoria/<slug>", max_length=80, unique=True, verbose_name="slug"),
        ),
    ]
