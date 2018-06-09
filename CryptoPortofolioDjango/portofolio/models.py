from django.db import models
from django.contrib.auth.models import User
from django import forms
# Create your models here.


class Protofolio(models.Model):

    owner = models.ForeignKey(User,on_delete = models.CASCADE)
    name = models.CharField(max_length=60,default ="default")

    def __str__(self):
        return '%s portofolio of %s ' % (self.name, self.owner.username)

class Curency(models.Model):
    name = models.CharField(max_length=60,default ="default")
    timestamp = models.DateTimeField()
    valueInDollar = models.DecimalField(max_digits=12, decimal_places=8)


class Coin(models.Model):
    name = models.CharField(max_length=60,default ="default")
    quantity = models.FloatField()
    tag = models.CharField(max_length=60, default="")
    portofolio = models.ForeignKey(Protofolio, on_delete = models.CASCADE)


class CoinForm(forms.ModelForm):
    class Meta:
        model = Coin
        fields = ['quantity','tag']

    def __init__(self, *args, **kwargs):
        super(CoinForm, self).__init__(*args, **kwargs)

        #Field Tag is not required
        self.fields['tag'].required = False

