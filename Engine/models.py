from django.db import models
import datetime

# Create your models here.
class PrintUser(models.Model):
    username    = models.CharField(max_length=255, help_text='User Name', unique=True)
    image_path  = models.CharField(max_length=255, help_text='Print Image path')
    is_clockedIn = models.BooleanField(default=False, help_text='Check for Clock in or out')
    clockin_on  = models.DateTimeField(blank=True, null=True)
    clockout_on = models.DateTimeField(blank=True, null=True)    
    created_at  = models.DateTimeField(auto_now_add=True, db_index=True)
    def __str__(self):
        return self.username

    def clockIn(self):
        self.clockin_on = datetime.datetime.now()
        self.is_clockedIn = True
        self.save()

    def clockedOff(self):        
        self.is_clockedIn = False
        self.clockout_on = datetime.datetime.now()
        self.save()

class Clocks(models.Model):
    user = models.ForeignKey(PrintUser, on_delete=models.CASCADE, help_text="PrintUser")
    clockin = models.DateTimeField(auto_now=False,  help_text="Clock In datetime")
    clockout = models.DateTimeField(auto_now=False, help_text="Clock In datetime")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def setValues(self, user):
        self.user = user
        self.clockin = user.clockin_on
        self.clockout = user.clockout_on
        self.save()