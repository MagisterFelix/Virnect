from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from django.utils.html import format_html

from .forms import RoomForm
from .models.history import History
from .models.language import Language
from .models.message import Message
from .models.notification import Notification
from .models.report import Report
from .models.room import Room
from .models.tag import Tag
from .models.topic import Topic
from .models.user import User


@admin.register(User)
class UserAdmin(UserAdmin):

    def avatar(self, user):
        return format_html(f"<img src=\"{user.image.url}\" style=\"max-width: 128px; max-height: 128px\"/>")

    fieldsets = (
        (None, {
            "fields": (
                "username", "password",
            )
        }),
        ("Personal info", {
            "fields": (
                "first_name", "last_name", "email", "avatar", "image", "about",
            )
        }),
        ("Permissions", {
            "fields": (
                "is_active", "is_staff", "is_superuser",
            )
        }),
        ("Important dates", {
            "fields": (
                "last_login", "last_seen", "date_joined",
            )
        }),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2")
            }
        ),
    )
    readonly_fields = ("avatar", "last_login", "last_seen", "date_joined",)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):

    def preview(self, topic):
        return format_html(f"<img src=\"{topic.image.url}\" style=\"max-width: 128px; max-height: 128px\"/>")

    list_display = ("title", "short_description",)
    fieldsets = (
        (None, {
            "fields": (
                "title",
            )
        }),
        ("Information", {
            "fields": (
                "description", "preview", "image",
            )
        }),
    )
    readonly_fields = ("preview",)


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):

    def preview(self, language):
        return format_html(f"<img src=\"{language.icon.url}\" style=\"max-width: 128px; max-height: 128px\"/>")

    list_display = ("name",)
    fieldsets = (
        (None, {
            "fields": (
                "name",
            )
        }),
        ("Information", {
            "fields": (
                "preview", "icon",
            )
        }),
    )
    readonly_fields = ("preview",)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):

    form = RoomForm

    def is_open(self, room):
        return len(room.key) == 0

    is_open.boolean = True
    list_display = ("title", "host", "topic", "language", "number_of_participants", "is_open", "created_at",)
    fieldsets = (
        (None, {
            "fields": (
                "title",
            )
        }),
        ("Information", {
            "fields": (
                "host", "topic", "language", "number_of_participants", "participants", "key", "created_at",
            )
        }),
    )
    readonly_fields = ("created_at",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):

    list_display = ("name", "room",)
    fieldsets = (
        (None, {
            "fields": (
                "name",
            )
        }),
        ("Information", {
            "fields": (
                "room",
            )
        }),
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):

    def is_reply(self, message):
        return message.reply_to is not None

    is_reply.boolean = True
    list_display = ("short_message", "room", "author", "is_reply", "created_at", "updated_at",)
    fieldsets = (
        (None, {
            "fields": (
                "text",
            )
        }),
        ("Information", {
            "fields": (
                "room", "author", "reply_to", "created_at", "updated_at",
            )
        }),
    )
    readonly_fields = ("created_at", "updated_at",)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):

    def save_model(self, request, obj, form, change):
        if change and obj.verdict:
            obj.reviewed_by = request.user

        super(ReportAdmin, self).save_model(request, obj, form, change)

    list_display = ("reason", "sender", "suspect", "verdict", "reviewed_by", "created_at", "is_viewed",)
    fieldsets = (
        (None, {
            "fields": (
                "reason",
            )
        }),
        ("Information", {
            "fields": (
                "sender", "suspect", "verdict", "reviewed_by", "created_at", "is_viewed",
            )
        }),
    )
    readonly_fields = ("created_at",)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = ("notification_type", "recipient", "content", "created_at", "is_viewed",)
    fieldsets = (
        (None, {
            "fields": (
                "notification_type",
            )
        }),
        ("Information", {
            "fields": (
                "recipient", "content", "created_at", "is_viewed",
            )
        }),
    )
    readonly_fields = ("created_at",)


@admin.register(History)
class HistoryAdmin(admin.ModelAdmin):

    list_display = ("recorded_at", "owner", "topic", "tags", "language",)
    fieldsets = (
        (None, {
            "fields": (
                "recorded_at",
            )
        }),
        ("Information", {
            "fields": (
                "owner", "topic", "tags", "language",
            )
        }),
    )
    readonly_fields = ("recorded_at",)


admin.site.unregister(Group)
