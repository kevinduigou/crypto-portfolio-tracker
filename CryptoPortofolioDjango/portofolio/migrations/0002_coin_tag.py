# Generated by Django 2.0.5 on 2018-05-30 11:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portofolio', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='coin',
            name='tag',
            field=models.CharField(default='', max_length=60),
        ),
    ]
