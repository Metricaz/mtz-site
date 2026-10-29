"""Links to the contact page of the old site become links to this site's /contato (SEO and GEO audit, item S4).

The Livelo case pointed to https://metricaz.com/contato/, which leaves the test environment (and, after
the switch, depends on the old URL structure).
"""

import re

from django.db import migrations

OLD_CONTACT_LINK = re.compile(r'href="https?://(?:www\.)?metricaz\.com/contato/?"')


def forwards(apps, schema_editor):
    for name in ("Case", "Post", "Service"):
        model = apps.get_model("content", name)
        for item in model.objects.filter(content_html__contains="metricaz.com/contato"):
            html = OLD_CONTACT_LINK.sub('href="/contato"', item.content_html)
            # update(): skips save(), which would re-run the HTML sanitizer for nothing.
            model.objects.filter(pk=item.pk).update(content_html=html)


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0012_cases_page_seo"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
