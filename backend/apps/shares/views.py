from rest_framework import viewsets, permissions
from .models import Share
from .serializers import ShareSerializer
from apps.accounts.views import IsAdminUser


class ShareViewSet(viewsets.ModelViewSet):
    serializer_class = ShareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Share.objects.select_related('member__user').all()
        if user.role != 'admin':
            qs = qs.filter(member__user=user)
        member_id = self.request.query_params.get('member')
        if member_id:
            qs = qs.filter(member__id=member_id)
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
