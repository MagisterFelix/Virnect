from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from core.server.models import Tag
from core.server.serializers import TagListSerializer


class TagListView(ListCreateAPIView):

    queryset = Tag.objects.all()
    serializer_class = TagListSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super(TagListView, self).get_queryset()

        unique = self.request.query_params.get("unique")
        if unique is not None:
            ids = set()
            names = set()

            for tag in queryset:
                if tag.name not in names:
                    ids.add(tag.id)
                    names.add(tag.name)

            queryset = queryset.filter(id__in=ids)

        return queryset
