from django.urls import path

from core.server.views import (AuthorizationView, DeauthorizationView, PasswordResetConfirmView, PasswordResetView,
                               RegistrationView, ReportView, RoomListView, TagListView, TopicListView, UserView)

urlpatterns = [
    path("sign-in/", AuthorizationView().as_view(), name="sign-in"),
    path("sign-up/", RegistrationView().as_view(), name="sign-up"),
    path("sign-out/", DeauthorizationView().as_view(), name="sign-out"),
    path("reset-password/", PasswordResetView().as_view(), name="reset-password"),
    path("reset-password/<uidb64>/<token>/", PasswordResetConfirmView().as_view(), name="reset-password-confirm"),
    path("profile/", UserView().as_view(), name="profile"),
    path("user/<username>/", UserView().as_view(), name="user"),
    path("report/", ReportView().as_view(), name="report"),
    path("topics/", TopicListView().as_view(), name="topics"),
    path("tags/", TagListView().as_view(), name="tags"),
    path("rooms/", RoomListView().as_view(), name="rooms"),
]
