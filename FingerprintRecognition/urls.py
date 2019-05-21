"""FingerprintRecognition URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
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
from django.contrib import admin
from django.urls import path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from Engine import views

urlpatterns = [
    path('index/',      views.index),
    path('process/',    views.process),
    path('clockout/',   views.clockOut),
    path('register/',   views.register),

    path('managepage/', views.adminpage),   # Administrator api
    path('adminapi/',   views.adminapi),    # Administrator api
    path('rmuser/',     views.userRemove),  # Delete a user
    path('login/',      views.login),       # login for admin page
    path('admin/',      admin.site.urls),
]

urlpatterns += staticfiles_urlpatterns()
