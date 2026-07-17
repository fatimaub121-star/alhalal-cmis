from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Member
from .serializers import MemberSerializer, MemberCreateSerializer


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.select_related('user').all()
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'gender', 'department']
    search_fields = ['member_id', 'user__first_name', 'user__last_name', 'user__email', 'phone']
    ordering_fields = ['created_at', 'member_id', 'date_joined_cooperative']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return MemberCreateSerializer
        return MemberSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        member = self.get_object()
        new_status = 'inactive' if member.status == 'active' else 'active'
        member.status = new_status
        member.user.is_active = (new_status == 'active')
        member.user.save()
        member.save()
        return Response({'status': new_status})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current logged-in member's profile."""
        if request.user.role != 'member':
            return Response({'detail': 'Not a member account.'}, status=403)
        member = Member.objects.get(user=request.user)
        serializer = MemberSerializer(member)
        return Response(serializer.data)
