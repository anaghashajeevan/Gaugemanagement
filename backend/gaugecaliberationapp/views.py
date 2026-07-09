from django.shortcuts import render

# Create your views here.
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import update_session_auth_hash
from django.utils import timezone

from .models import User, Role, Department, AuditLog
from .serializers import (
    UserSerializer, RoleSerializer, DepartmentSerializer,
    LoginSerializer, ChangePasswordSerializer, AuditLogSerializer
)


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


def create_audit(user, action, module, description=None, record_id=None, ip=None):
    try:
        AuditLog.objects.create(
            user=user if user and user.is_authenticated else None,
            user_name=user.full_name if user and user.is_authenticated else 'System',
            action=action,
            module=module,
            description=description,
            record_id=str(record_id) if record_id else None,
            ip_address=ip
        )
    except Exception as e:
        print(f'Audit error: {e}')


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role and request.user.role.code == 'admin'


# ============ LOGIN VIEW ============
class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '')
        ip = get_client_ip(request)
        
        try:
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                user = User.objects.get(email=email)
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])
                create_audit(user, 'LOGIN', 'authentication',
                             f'{user.full_name} logged in', user.id, ip)
            return response
        except Exception:
            create_audit(None, 'LOGIN_FAILED', 'authentication',
                         f'Failed login attempt for {email}', None, ip)
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )


# ============ LOGOUT ============
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        create_audit(request.user, 'LOGOUT', 'authentication',
                     f'{request.user.full_name} logged out',
                     request.user.id, get_client_ip(request))
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)


# ============ CURRENT USER (whoami) ============
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# ============ CHANGE PASSWORD ============
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.must_change_password = False
        user.save()
        update_session_auth_hash(request, user)
        
        create_audit(user, 'UPDATE', 'authentication',
                     f'{user.full_name} changed password', user.id, get_client_ip(request))
        
        return Response({'detail': 'Password changed successfully.'})


# ============ ROLE VIEWSET ============
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdmin]
    
    def perform_create(self, serializer):
        role = serializer.save()
        create_audit(self.request.user, 'CREATE', 'roles',
                     f'Created role: {role.name}', role.id, get_client_ip(self.request))
    
    def perform_update(self, serializer):
        role = serializer.save()
        create_audit(self.request.user, 'UPDATE', 'roles',
                     f'Updated role: {role.name}', role.id, get_client_ip(self.request))
    
    def perform_destroy(self, instance):
        create_audit(self.request.user, 'DELETE', 'roles',
                     f'Deleted role: {instance.name}', instance.id, get_client_ip(self.request))
        instance.delete()


# ============ DEPARTMENT VIEWSET ============
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        department = serializer.save()
        create_audit(self.request.user, 'CREATE', 'departments',
                     f'Created department {department.name}', department.id, get_client_ip(self.request))

    def perform_update(self, serializer):
        department = serializer.save()
        create_audit(self.request.user, 'UPDATE', 'departments',
                     f'Updated department {department.name}', department.id, get_client_ip(self.request))

    def perform_destroy(self, instance):
        name = instance.name
        dept_id = instance.id
        instance.delete()
        create_audit(self.request.user, 'DELETE', 'departments',
                     f'Deleted department {name}', dept_id, get_client_ip(self.request))


# ============ USER VIEWSET ============
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('role', 'department')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def perform_create(self, serializer):
        user = serializer.save()
        create_audit(self.request.user, 'CREATE', 'user_management',
                     f'Created user: {user.full_name} ({user.email})',
                     user.id, get_client_ip(self.request))
    
    def perform_update(self, serializer):
        user = serializer.save()
        create_audit(self.request.user, 'UPDATE', 'user_management',
                     f'Updated user: {user.full_name}', user.id, get_client_ip(self.request))
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        create_audit(self.request.user, 'DELETE', 'user_management',
                     f'Deactivated user: {instance.full_name}',
                     instance.id, get_client_ip(self.request))
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('new_password')
        if not new_password or len(new_password) < 6:
            return Response({'detail': 'Password must be at least 6 characters.'},
                            status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.must_change_password = True
        user.save()
        create_audit(request.user, 'UPDATE', 'user_management',
                     f'Password reset for {user.full_name}', user.id, get_client_ip(request))
        return Response({'detail': 'Password reset successfully.'})


# ============ AUDIT LOG ============
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]