"""cryptoportofolio URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
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
from portofolio import views
from django.conf.urls import include
from django.contrib.auth import views as auth_views

urlpatterns = [

    path('', views.index),
    path('accounts/logout/', auth_views.logout,{'next_page': '/index'}, name = 'logout'),
    path('about/', views.about),
    path('index/', views.index,name='index'),
    path('accounts/',include('django.contrib.auth.urls')),
    path('signup/', views.signup),
    path('admin/', admin.site.urls),
    path('portofolio/', views.index),
    path('portofolio/piechart', views.piechart),
    path('portofolio/historychart', views.historychart),
    path('deletecoin/<int:coinToDeleteId>', views.deletecoin, name='delete-coin'),
    path('modifycoin/<int:coinToModifyId>/', views.modifycoin, name='modify-coin'),
    path('addcoin/<str:coinToAdd>/', views.addcoin, name='add-coin'),
    path('addcoin/', views.addcoin, name='add-coin'),
    path('modifycoin/', views.modifycoin, name='modify-coin')

]

