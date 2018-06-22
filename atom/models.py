from __future__ import unicode_literals

from django.db import models
from mongoengine import *

# Model function for perform CRUD on MongoDB
# connect('192.168.1.128')
#connect('userDailyBackupTask', host='192.168.1.128', port=27017)
# Create your models here.

class Attachment(models.Model):
    objects = None
    title = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='media/attach/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


def getModel(db_table):
    class ModelClass(DynamicDocument):
        # name = StringField()
        meta = {'collection': db_table}

    return ModelClass
