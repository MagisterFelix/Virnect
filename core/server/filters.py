import django_filters as filters
from django.db.models import Count, F, Q

from core.server.models import Room, Tag


class RoomFilter(filters.FilterSet):

    search = filters.CharFilter(field_name="title", lookup_expr="icontains")
    host = filters.CharFilter(field_name="host__username", lookup_expr="iexact")
    topic = filters.CharFilter(field_name="topic__title", lookup_expr="iexact")
    language = filters.CharFilter(method="filter_language")
    is_available = filters.BooleanFilter(method="filter_is_available")
    is_open = filters.BooleanFilter(field_name="key", method="filter_is_open")
    tags = filters.CharFilter(method="filter_tags")
    ordering = filters.CharFilter(method="order_by")

    def filter_language(self, queryset, _, value):
        languages = {value: key for key, value in Room.Language.choices}
        return queryset.filter(language=languages.get(value))

    def filter_is_available(self, queryset, _, value):
        queryset = queryset.annotate(count_of_participants=Count("participants"))

        if value:
            queryset = queryset.filter(
                Q(count_of_participants__lt=F("number_of_participants")) | Q(count_of_participants=0)
            )
        else:
            queryset = queryset.filter(Q(count_of_participants=F("number_of_participants")))

        return queryset

    def filter_is_open(self, queryset, _, value):
        return queryset.filter(key="") if value else queryset.exclude(key="")

    def filter_tags(self, queryset, _, value):
        tags = Tag.objects.filter(name__in=value.split(","))
        return queryset.filter(id__in=[tag.room_id for tag in tags])

    def order_by(self, queryset, _, value):
        queryset = queryset.annotate(count_of_participants=Count("participants"))

        if value in ["created_at", "-created_at", "count_of_participants", "-count_of_participants"]:
            return queryset.order_by(value)

        return queryset

    class Meta:
        model = Room
        fields = ("search", "host", "topic", "language", "is_available", "is_open", "tags", "created_at", "ordering",)
