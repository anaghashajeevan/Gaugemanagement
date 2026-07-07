from rest_framework import serializers
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Role, Department, AuditLog


# ============ ROLE ============
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'code', 'description', 'level', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


# ============ DEPARTMENT ============
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'location_type', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


# ============ USER ============
class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    role_code = serializers.CharField(source='role.code', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone',
            'role', 'role_name', 'role_code',
            'department', 'department_name',
            'is_active', 'must_change_password',
            'last_login', 'created_at', 'password'
        ]
        read_only_fields = ['id', 'last_login', 'created_at']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
            instance.must_change_password = True
        instance.save()
        return instance


# ============ LOGIN (JWT with EMAIL) ============
class LoginSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # Login with email
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['full_name'] = user.full_name
        token['role'] = user.role.code if user.role else None
        token['role_name'] = user.role.name if user.role else None
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        user = self.user
        if not user.is_active:
            raise serializers.ValidationError('Account is deactivated. Contact administrator.')
        
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role.code if user.role else None,
            'role_name': user.role.name if user.role else None,
            'department': user.department.name if user.department else None,
            'must_change_password': user.must_change_password,
        }
        return data


# ============ CHANGE PASSWORD ============
class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value


# ============ AUDIT LOG ============
class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ['id', 'timestamp', 'user_name', 'action', 'module', 'record_id', 'description', 'ip_address']
        read_only_fields = fields