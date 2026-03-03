from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Note, Tag
from .serializers import NoteSerializer, TagSerializer


class IsOwner(permissions.BasePermission):
    """Allow access only to the object's owner."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


# ─── Note filter ─────────────────────────────────────────────────────────────

class NoteFilter(django_filters.FilterSet):
    tag = django_filters.NumberFilter(field_name='tags__id', label='Tag ID')
    is_pinned = django_filters.BooleanFilter()
    is_archived = django_filters.BooleanFilter()

    class Meta:
        model = Note
        fields = ['tag', 'is_pinned', 'is_archived']


# ─── Tag ViewSet ──────────────────────────────────────────────────────────────

class TagViewSet(viewsets.ModelViewSet):
    """
    GET  /api/tags/       — list caller's tags
    POST /api/tags/       — create a tag for the caller
    """

    serializer_class = TagSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwner)
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Tag deleted successfully.'},
            status=status.HTTP_200_OK
        )


# ─── Note ViewSet ─────────────────────────────────────────────────────────────

class NoteViewSet(viewsets.ModelViewSet):
    """
    GET    /api/notes/       — list caller's notes (search, filter, paginate)
    POST   /api/notes/       — create a note
    GET    /api/notes/{id}/  — retrieve a single note
    PUT    /api/notes/{id}/  — full update
    PATCH  /api/notes/{id}/  — partial update
    DELETE /api/notes/{id}/  — delete
    """

    serializer_class = NoteSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwner)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = NoteFilter
    search_fields = ('title', 'content')
    ordering_fields = ('created_at', 'updated_at', 'is_pinned')

    def get_queryset(self):
        return (
            Note.objects.filter(user=self.request.user)
            .prefetch_related('tags')
            .select_related('user')
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Note deleted successfully.'},
            status=status.HTTP_200_OK
        )
