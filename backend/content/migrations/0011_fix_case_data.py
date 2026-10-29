"""Data fixes in the Livelo and Burger King cases (SEO and GEO audit, 28/10/2026, items S3 and S8).

Each field is only changed while it still holds the wrong value found on the test site, so anything
already fixed or edited in the admin stays as it is.
"""

from django.db import migrations

# slug: [(field lookup matching the wrong value, {field: fixed value})]
FIXES = {
    "livelo-ga4": [
        # The card said "+30% Conversão"; the case itself reports +71% in Clube sales.
        ({"kpi_value": "+30%", "kpi_label": "Conversão"}, {"kpi_value": "+71%", "kpi_label": "vendas do Clube"}),
        # Scope held a truncated copy of the introduction.
        (
            {"service_stack__startswith": "Na Metricaz, acreditamos"},
            {"service_stack": "GA4, Google Ads, Firebase, AppsFlyer, biblioteca de tagueamento"},
        ),
    ],
    "iot-analytics": [
        ({"client_name": "Burguer King"}, {"client_name": "Burger King"}),
        ({"service_stack": ""}, {"service_stack": "GA4, Firebase, Looker Studio, User ID"}),
        ({"tag": "Burger King, Tagueamento,"}, {"tag": "Burger King, Tagueamento"}),
    ],
}


def forwards(apps, schema_editor):
    Case = apps.get_model("content", "Case")
    for slug, fixes in FIXES.items():
        for wrong, fixed in fixes:
            Case.objects.filter(slug=slug, **wrong).update(**fixed)


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0010_deactivate_example_content"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
