from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Member


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['full_name'] = user.full_name
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['full_name'] = self.user.full_name
        data['email'] = self.user.email
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined']
        read_only_fields = ['date_joined']


class MemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    total_savings = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_shares = serializers.IntegerField(read_only=True)

    class Meta:
        model = Member
        fields = [
            'id', 'member_id', 'full_name', 'email', 'phone', 'gender',
            'date_of_birth', 'address', 'department', 'date_joined_cooperative',
            'status', 'next_of_kin_name', 'next_of_kin_phone',
            'is_active', 'total_savings', 'total_shares', 'created_at',
        ]
        read_only_fields = ['created_at', 'member_id']


class MemberCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Member
        fields = [
            'email', 'first_name', 'last_name', 'password',
            'phone', 'gender', 'date_of_birth', 'address',
            'department', 'date_joined_cooperative',
            'next_of_kin_name', 'next_of_kin_phone',
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            role='member',
        )

        # Auto-generate member ID
        count = Member.objects.count() + 1
        member_id = f'ACMS{count:04d}'

        member = Member.objects.create(
            user=user,
            member_id=member_id,
            **validated_data
        )
        return member

    def to_representation(self, instance):
        return MemberSerializer(instance, context=self.context).data
