from django.contrib import admin
from .models import Note, Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user')
    list_filter = ('user',)
    search_fields = ('name',)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'is_pinned', 'is_archived', 'created_at', 'updated_at')
    list_filter = ('user', 'is_pinned', 'is_archived')
    search_fields = ('title', 'content')
    filter_horizontal = ('tags',)
