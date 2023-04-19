from django.urls import path

from core.server.views import (AuthorizationView, DeauthorizationView, MessageListView, MessageView,
                               NotificationListView, NotificationView, PasswordResetConfirmView, PasswordResetView,
                               ProfileView, RegistrationView, ReportListView, ReportView, RoomListView, RoomView,
                               TagListView, TagView, TopicListView, TopicView, UserView)

urlpatterns = [
    path("sign-in/", AuthorizationView().as_view(), name="sign-in"),
    path("sign-up/", RegistrationView().as_view(), name="sign-up"),
    path("sign-out/", DeauthorizationView().as_view(), name="sign-out"),
    path("reset-password/", PasswordResetView().as_view(), name="reset-password"),
    path("reset-password/<uidb64>/<token>/", PasswordResetConfirmView().as_view(), name="reset-password-confirm"),
    path("profile/", ProfileView().as_view(), name="profile"),
    path("notifications/", NotificationListView().as_view(), name="notifications"),
    path("notification/<pk>/", NotificationView().as_view(), name="notification"),
    path("user/<username>/", UserView().as_view(), name="user"),
    path("reports/", ReportListView().as_view(), name="reports"),
    path("report/<pk>/", ReportView().as_view(), name="report"),
    path("topics/", TopicListView().as_view(), name="topics"),
    path("topic/<pk>/", TopicView().as_view(), name="topic"),
    path("tags/", TagListView().as_view(), name="tags"),
    path("tag/<pk>/", TagView().as_view(), name="tag"),
    path("rooms/", RoomListView().as_view(), name="rooms"),
    path("room/<title>/", RoomView().as_view(), name="room"),
    path("messages/<room>/", MessageListView().as_view(), name="messages"),
    path("message/<room>/<pk>/", MessageView().as_view(), name="message"),
]
