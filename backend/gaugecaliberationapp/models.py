from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class Role(models.Model):
    """Separate Role table so admin can add new roles dynamically."""
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=30, unique=True, help_text="Internal code like 'admin', 'quality_engineer'")
    description = models.TextField(blank=True, null=True)
    level = models.IntegerField(default=10, help_text="Higher = more privileges")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roles'
        ordering = ['-level']
    
    def __str__(self):
        return self.name


class Department(models.Model):
    """Simple department reference (can be expanded later)."""
    name = models.CharField(max_length=100, unique=True)
    location_type = models.CharField(
        max_length=30,
        choices=[
            ('store', 'Store'),
            ('gauge_room', 'Gauge Room'),
            ('shop_floor', 'Shop Floor'),
            ('other', 'Other'),
        ],
        default='other'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'departments'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        if not full_name:
            raise ValueError('Full name is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model — uses EMAIL for login."""
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='users', null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, related_name='users', null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    must_change_password = models.BooleanField(default=True)
    
    last_login = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['full_name']
    
    def __str__(self):
        return f'{self.full_name} ({self.email})'


class AuditLog(models.Model):
    """Track important actions (login, logout, create/edit/delete)."""
    ACTION_CHOICES = [
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('LOGIN_FAILED', 'Login Failed'),
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ]
    
    timestamp = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    user_name = models.CharField(max_length=100, blank=True, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    module = models.CharField(max_length=50)
    record_id = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f'{self.action} - {self.module} by {self.user_name} @ {self.timestamp}'