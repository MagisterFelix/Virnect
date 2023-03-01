from django.urls import path

from core.server.views.auth import AuthorizationView, RegistrationView

urlpatterns = [
    path("sign-in/", AuthorizationView().as_view(), name="sign-in"),
    path("sign-up/", RegistrationView().as_view(), name="sign-up"),
]
