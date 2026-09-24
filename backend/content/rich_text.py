"""
Rich-text images are stored by reference: <img data-image-id="42" alt="...">, never by URL.

- On save (`normalize`): any `src` on a referenced image is dropped, and unknown ids are rejected.
- On read (`resolve`): the current URL of each ContentImage is filled in; a reference to an image
  that no longer exists is removed from the HTML.
"""

import re
from html import escape

from .models import ContentImage

IMG_TAG = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
IMAGE_ID = re.compile(r"""\bdata-image-id\s*=\s*["']?(\d+)""", re.IGNORECASE)
SRC_ATTR = re.compile(r"""\s+src\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)""", re.IGNORECASE)


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
        return SRC_ATTR.sub("", tag) if IMAGE_ID.search(tag) else tag

    return IMG_TAG.sub(strip_src, html or ""), missing


def resolve(html, build_url):
    """Fill in src for every referenced image; `build_url` turns a media URL into the final one."""
    ids = image_ids(html)
    urls = {img.pk: build_url(img.image.url) for img in ContentImage.objects.filter(pk__in=ids)}

    def fill_src(match):
        tag = match.group(0)
        found = IMAGE_ID.search(tag)
        if not found:
            return tag
        url = urls.get(int(found.group(1)))
        if url is None:
            return ""
        return re.sub(r"^<img\b", f'<img src="{escape(url)}"', SRC_ATTR.sub("", tag), flags=re.IGNORECASE)

    return IMG_TAG.sub(fill_src, html or "")
