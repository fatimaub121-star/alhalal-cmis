from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SavingsViewSet

router = DefaultRouter()
router.register('', SavingsViewSet, basename='savings')

urlpatterns = [path('', include(router.urls))]
