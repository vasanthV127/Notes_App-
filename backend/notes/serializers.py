from rest_framework import serializers
from .models import Note, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name')
        read_only_fields = ('id',)

    def create(self, validated_data):
        # Automatically associate the tag with the requesting user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Tag.objects.none(),  # queryset set dynamically in __init__
        source='tags',
        required=False,
    )

    class Meta:
        model = Note
        fields = (
            'id', 'title', 'content', 'is_pinned', 'is_archived',
            'created_at', 'updated_at', 'tags', 'tag_ids',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'tags')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            self.fields['tag_ids'].child_relation.queryset = Tag.objects.filter(
                user=request.user
            )

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        note = Note.objects.create(user=self.context['request'].user, **validated_data)
        note.tags.set(tags)
        return note

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance
