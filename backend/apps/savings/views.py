from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Savings
from .serializers import SavingsSerializer
from apps.accounts.views import IsAdminUser


class SavingsViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            qs = Savings.objects.select_related('member__user').all()
            member_id = self.request.query_params.get('member')
            if member_id:
                qs = qs.filter(member__id=member_id)
            return qs
        # Member sees only their own
        return Savings.objects.filter(member__user=user)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Return total savings per member or overall."""
        member_id = request.query_params.get('member')
        qs = self.get_queryset()
        if member_id:
            qs = qs.filter(member__id=member_id)
        total = qs.aggregate(total=Sum('amount'))['total'] or 0
        return Response({'total_savings': total})
