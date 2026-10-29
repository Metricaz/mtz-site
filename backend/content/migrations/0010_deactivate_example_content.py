"""Takes the example case and post (from the old initial_content fixture) off the site (SEO and GEO audit, 28/10/2026).

They are only deactivated, never deleted: they disappear from the site (the pages answer 404) and stay
in the admin. Each one is matched by slug and by its example marker, so real content is never touched.
"""

from django.db import migrations


def forwards(apps, schema_editor):
    apps.get_model("content", "Case").objects.filter(slug="case-de-exemplo", client_name="Cliente Exemplo").update(
        is_active=False
    )
    apps.get_model("content", "Post").objects.filter(
        slug="google-consent-mode-v2", subtitle__startswith="Post de exemplo"
    ).update(is_active=False)


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0009_seo_options"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
