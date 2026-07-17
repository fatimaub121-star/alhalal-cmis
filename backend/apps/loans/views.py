from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Loan, LoanRepayment
from .serializers import LoanSerializer, LoanApplySerializer, LoanRepaymentSerializer
from apps.accounts.views import IsAdminUser


class LoanViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Loan.objects.select_related('member__user').prefetch_related('repayments').all()
        if user.role != 'admin':
            qs = qs.filter(member__user=user)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        member_filter = self.request.query_params.get('member')
        if member_filter:
            qs = qs.filter(member__id=member_filter)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return LoanApplySerializer
        return LoanSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'approve', 'reject', 'record_repayment']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        loan = self.get_object()
        if loan.status != 'pending':
            return Response({'detail': 'Only pending loans can be approved.'}, status=400)
        from decimal import Decimal
        amount_approved = Decimal(str(request.data.get('amount_approved', loan.amount_requested)))
        repayment_months = int(request.data.get('repayment_months', loan.repayment_months))
        loan.status = 'approved'
        loan.amount_approved = amount_approved
        loan.repayment_months = repayment_months
        loan.monthly_repayment = amount_approved / repayment_months
        loan.approved_on = timezone.now().date()
        loan.approved_by = request.user
        loan.admin_notes = request.data.get('admin_notes', '')
        loan.save()
        return Response(LoanSerializer(loan).data)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        loan = self.get_object()
        if loan.status != 'pending':
            return Response({'detail': 'Only pending loans can be rejected.'}, status=400)
        loan.status = 'rejected'
        loan.admin_notes = request.data.get('admin_notes', '')
        loan.save()
        return Response(LoanSerializer(loan).data)

    @action(detail=True, methods=['post'])
    def record_repayment(self, request, pk=None):
        loan = self.get_object()
        if loan.status not in ['approved', 'disbursed', 'repaying']:
            return Response({'detail': 'Cannot record repayment for this loan status.'}, status=400)
        amount = float(request.data.get('amount', 0))
        if amount <= 0:
            return Response({'detail': 'Amount must be greater than zero.'}, status=400)

        repayment = LoanRepayment.objects.create(
            loan=loan,
            amount=amount,
            date_paid=request.data.get('date_paid', timezone.now().date()),
            recorded_by=request.user,
            notes=request.data.get('notes', ''),
        )

        loan.total_repaid = float(loan.total_repaid) + amount
        loan.status = 'repaying'
        if loan.total_repaid >= float(loan.amount_approved or loan.amount_requested):
            loan.status = 'completed'
        loan.save()

        return Response(LoanRepaymentSerializer(repayment).data, status=201)
