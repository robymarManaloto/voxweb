from django.db import models
from django.utils import timezone

class UserProfile(models.Model):
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.username

class Project(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    last_update = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username}'s {self.name} Project"

class Page(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()

    def __str__(self):
        return f"{self.project.user.username}'s {self.project.name} Project - {self.title}"
