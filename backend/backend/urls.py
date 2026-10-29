"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path

from content.sitemaps import SITEMAPS
from content.views import robots_txt

urlpatterns = [
    path('admin/', admin.site.urls),
    # Dashboard login/logout: Django's own views (username + password, session cookie).
    path('dashboard/login/', auth_views.LoginView.as_view(), name='login'),
    path('dashboard/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('api/', include('content.urls')),
    # For search engines; nginx sends these two addresses here (every other page is the Node server).
    path('sitemap.xml', sitemap, {'sitemaps': SITEMAPS}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', robots_txt, name='robots-txt'),
]

# Uploaded files in development (production serves /media/ from the web server).
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
