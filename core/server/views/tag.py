from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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

    def create(self, request):
        serializer = self.serializer_class(
            data=request.data,
            many=isinstance(request.data, list),
            context={"request": request, "count": len(request.data) if isinstance(request.data, list) else 1}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        headers = self.get_success_headers(serializer.data)

        return Response(serializer.data, headers=headers, status=status.HTTP_201_CREATED)
