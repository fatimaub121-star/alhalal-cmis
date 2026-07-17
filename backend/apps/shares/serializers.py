from rest_framework import serializers
from .models import Share

class ShareSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.full_name', read_only=True)
    member_id_str = serializers.CharField(source='member.member_id', read_only=True)
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Share
        fields = ['id', 'member', 'member_name', 'member_id_str', 'quantity',
                  'unit_value', 'total_value', 'date_allocated', 'notes', 'created_at']
        read_only_fields = ['created_at']
