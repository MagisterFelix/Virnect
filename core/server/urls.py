from django.urls import path

from core.server.views.auth import (AuthorizationView, DeauthorizationView, PasswordResetConfirmView,
                                    PasswordResetView, RegistrationView)

urlpatterns = [
    path("sign-in/", AuthorizationView().as_view(), name="sign-in"),
    path("sign-up/", RegistrationView().as_view(), name="sign-up"),
    path("sign-out/", DeauthorizationView().as_view(), name="sign-out"),
    path("reset-password/", PasswordResetView().as_view(), name="reset-password"),
    path("reset-password/<uid>/<token>/", PasswordResetConfirmView().as_view(), name="reset-password-confirm"),
]
