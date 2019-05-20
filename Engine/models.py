from django.db import models

# Create your models here.
class PrintUser(models.Model):
    username    = models.CharField(max_length=255, help_text='User Name')
    image_path  = models.CharField(max_length=255, help_text='Print Image path')
    is_clockedIn = models.BooleanField(default=False, help_text='Check for Clock in or out')
    clockin_on  = models.DateTimeField(auto_now=True, db_index=True)
    clockout_on = models.DateTimeField(auto_now=True, db_index=True)

    def __init__(self, username, path):
        self.username = username
        self.image_path = path


class Clocks(models.Model):
    user = models.ForeignKey(PrintUser, on_delete=models.CASCADE, help_text="PrintUser")
    clockin = models.DateTimeField(auto_now=False,  help_text="Clock In datetime")
    clockout = models.DateTimeField(auto_now=False, help_text="Clock In datetime")