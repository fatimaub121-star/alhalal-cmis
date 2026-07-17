from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.full_name', read_only=True)
    member_id_str = serializers.CharField(source='member.member_id', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'member', 'member_name', 'member_id_str',
                  'transaction_type', 'amount', 'description',
                  'reference', 'date', 'created_at']
        read_only_fields = ['created_at']
