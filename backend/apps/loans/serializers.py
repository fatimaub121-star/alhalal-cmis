from rest_framework import serializers
from .models import Loan, LoanRepayment


class LoanRepaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanRepayment
        fields = ['id', 'loan', 'amount', 'date_paid', 'notes', 'created_at']
        read_only_fields = ['created_at']


class LoanSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.full_name', read_only=True)
    member_id_str = serializers.CharField(source='member.member_id', read_only=True)
    balance_outstanding = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    repayments = LoanRepaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Loan
        fields = [
            'id', 'loan_number', 'member', 'member_name', 'member_id_str',
            'amount_requested', 'amount_approved', 'purpose', 'status',
            'applied_on', 'approved_on', 'repayment_months', 'monthly_repayment',
            'total_repaid', 'balance_outstanding', 'admin_notes',
            'repayments', 'created_at',
        ]
        read_only_fields = ['loan_number', 'applied_on', 'total_repaid', 'created_at']


class LoanApplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = ['member', 'amount_requested', 'purpose', 'repayment_months']

    def to_representation(self, instance):
        return LoanSerializer(instance, context=self.context).data
