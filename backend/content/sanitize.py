"""
HTML sanitizing for rich text (services and cases), which the site renders as raw HTML.

The allowlist matches what the dashboard's editor produces (Tiptap StarterKit + Image): anything else
— <script>, event handlers (onclick…), javascript: links, styles, iframes — is removed.
"""

import nh3

ALLOWED_TAGS = {
    "p", "br", "hr", "h2", "h3", "h4",
    "strong", "em", "u", "s", "code", "pre", "blockquote",
    "ul", "ol", "li",
    "a", "img",
}

ALLOWED_ATTRIBUTES = {
    "a": {"href", "target"},
    "img": {"src", "alt", "title", "data-image-id"},
    "ol": {"start"},
}


def sanitize_html(html):
    return nh3.clean(
        html or "",
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        url_schemes={"http", "https", "mailto", "tel"},
        link_rel="noopener noreferrer",
    )
