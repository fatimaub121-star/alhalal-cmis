from rest_framework import serializers
from .models import Savings
from apps.accounts.serializers import MemberSerializer


class SavingsSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.full_name', read_only=True)
    member_id_str = serializers.CharField(source='member.member_id', read_only=True)

    class Meta:
        model = Savings
        fields = [
            'id', 'member', 'member_name', 'member_id_str', 'amount',
            'month', 'date_recorded', 'notes', 'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']
