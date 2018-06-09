from django.contrib import admin

# Register your models here.

from .models import Protofolio
from .models import Curency
from .models import Coin

admin.site.register(Protofolio)
admin.site.register(Curency)
admin.site.register(Coin)