from django.db import models
from django.contrib.auth.models import User


class Tag(models.Model):
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')

    class Meta:
        ordering = ['name']
        # Each user can have each tag name only once
        unique_together = ('name', 'user')

    def __str__(self):
        return f'{self.user.username} — {self.name}'


class Note(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    is_pinned = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    tags = models.ManyToManyField(Tag, blank=True, related_name='notes')

    class Meta:
        ordering = ['-is_pinned', '-updated_at']

    def __str__(self):
        return f'{self.user.username} — {self.title}'
