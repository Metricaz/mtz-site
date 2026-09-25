"""
Rich-text images are stored by reference: <img data-image-id="42" alt="...">, never by URL.

- On save (`normalize`): any `src` on a referenced image is dropped, and unknown ids are rejected.
- On read (`resolve`): the current URL and the width/height of each ContentImage are filled in
  (width/height only give the browser the aspect ratio, to reserve space and avoid layout shift;
  the displayed size comes from CSS). A reference to an image that no longer exists is removed.
"""

import re
from html import escape

from .models import ContentImage

IMG_TAG = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
IMAGE_ID = re.compile(r"""\bdata-image-id\s*=\s*["']?(\d+)""", re.IGNORECASE)
SERVER_ATTRS = re.compile(r"""\s+(?:src|width|height)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)""", re.IGNORECASE)


def image_ids(html):
    ids = set()
    for tag in IMG_TAG.findall(html or ""):
        match = IMAGE_ID.search(tag)
        if match:
            ids.add(int(match.group(1)))
    return ids


def normalize(html):
    """Returns (html without src on referenced images, ids that don't exist)."""
    ids = image_ids(html)
    missing = ids - set(ContentImage.objects.filter(pk__in=ids).values_list("pk", flat=True))

    def strip_src(match):
        tag = match.group(0)
        return SERVER_ATTRS.sub("", tag) if IMAGE_ID.search(tag) else tag

    return IMG_TAG.sub(strip_src, html or ""), missing


def resolve(html):
    """Fill in src (relative media URL) for every referenced image."""
    ids = image_ids(html)
    images = {img.pk: img for img in ContentImage.objects.filter(pk__in=ids)}

    def fill_src(match):
        tag = match.group(0)
        found = IMAGE_ID.search(tag)
        if not found:
            return tag
        image = images.get(int(found.group(1)))
        if image is None:
            return ""
        attrs = f' src="{escape(image.image.url)}"'
        if image.width and image.height:
            attrs += f' width="{image.width}" height="{image.height}"'
        return re.sub(r"^<img\b", lambda _: f"<img{attrs}", SERVER_ATTRS.sub("", tag), flags=re.IGNORECASE)

    return IMG_TAG.sub(fill_src, html or "")
