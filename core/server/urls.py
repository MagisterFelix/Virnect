from django.urls import path

from core.server.views.auth import AuthorizationView, PasswordResetConfirmView, PasswordResetView, RegistrationView

urlpatterns = [
    path("sign-in/", AuthorizationView().as_view(), name="sign-in"),
    path("sign-up/", RegistrationView().as_view(), name="sign-up"),
    path("reset-password/", PasswordResetView().as_view(), name="reset-password"),
    path("reset-password/<uid>/<token>/", PasswordResetConfirmView().as_view(), name="reset-password-confirm"),
]
