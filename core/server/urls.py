from django.urls import path

from core.server.views.auth import (AuthorizationView, DeauthorizationView, PasswordResetConfirmView,
                                    PasswordResetView, RegistrationView)
from core.server.views.user import ProfileView, UserView

urlpatterns = [
    path("sign-in/", AuthorizationView().as_view(), name="sign-in"),
    path("sign-up/", RegistrationView().as_view(), name="sign-up"),
    path("sign-out/", DeauthorizationView().as_view(), name="sign-out"),
    path("reset-password/", PasswordResetView().as_view(), name="reset-password"),
    path("reset-password/<uidb64>/<token>/", PasswordResetConfirmView().as_view(), name="reset-password-confirm"),
    path("profile/", ProfileView().as_view(), name="profile"),
    path("user/<username>/", UserView().as_view(), name="user"),
]
