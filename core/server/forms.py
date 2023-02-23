
from django import forms
from django.core.exceptions import ValidationError

from .models.room import Room


class RoomForm(forms.ModelForm):

    class Meta:
        model = Room
        fields = "__all__"

    def clean(self):
        title = self.cleaned_data.get("title")
        participants = self.cleaned_data.get("participants")
        max_number_of_participants = self.cleaned_data.get("number_of_participants")

        if participants.count() > max_number_of_participants:
            raise ValidationError(
                "Count of participants cannot be more than maximum number of participants.",
                code="invalid"
            )

        if Room.objects.exclude(title=title).filter(participants__in=[*participants]).count() != 0:
            raise ValidationError("User cannot be in two or more rooms at once.", code="invalid")

        return self.cleaned_data
