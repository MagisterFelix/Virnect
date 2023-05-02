from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.server.models import Room, Tag, Topic, User


class StatisticsView(APIView):

    permission_classes = (IsAdminUser,)

    def get(self, request):
        popular_topics = [
            {
                "title": topic.title,
                "image": request.build_absolute_uri(topic.image.url),
                "count": topic.count
            }
            for topic in Topic.objects.annotate(
                count=Count("room")
            ).order_by("-count")[:3]
        ]

        languages = dict(Room.Language.choices)
        preferred_languages = [
            {
                "code": language["language"],
                "name": languages.get(language["language"]),
                "count": language["count"]
            }
            for language in Room.objects.values("language").annotate(
                count=Count("language")
            ).order_by("-count")[:3]
        ]

        frequent_tags = Tag.objects.values("name").annotate(
            count=Count("name")
        ).order_by("-count")[:3]

        count_of_rooms = Room.objects.count()
        count_of_active_rooms = Room.objects.annotate(
            count_of_participants=Count("participants")
        ).filter(count_of_participants__gt=0).count()

        count_of_users = User.objects.count()
        count_of_active_users = User.objects.filter(
            Q(last_seen__gte=timezone.now() - timedelta(days=3)) | Q(last_seen__isnull=True)
        ).count()
        count_of_online_users = len([user for user in User.objects.all() if user.is_online])
        count_of_blocked_users = User.objects.filter(is_active=False).count()

        data = {
            "popular_topics": popular_topics,
            "preferred_languages": preferred_languages,
            "frequent_tags": frequent_tags,
            "count_of_rooms": count_of_rooms,
            "count_of_active_rooms": count_of_active_rooms,
            "count_of_users": count_of_users,
            "count_of_active_users": count_of_active_users,
            "count_of_online_users": count_of_online_users,
            "count_of_blocked_users": count_of_blocked_users,
        }

        response = Response(data=data, status=status.HTTP_200_OK)

        return response
