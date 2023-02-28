from django.urls import path

from core.server.views.auth import AuthorizationView

urlpatterns = [
    path("sign-in/", AuthorizationView().as_view(), name="sign_in"),
]
