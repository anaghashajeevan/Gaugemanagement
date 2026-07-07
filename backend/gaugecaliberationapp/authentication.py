"""
Custom JWT Authentication for Gauge Calibration Client Portal.
Uses PyJWT directly — matches the frontend's api.ts token format
(access_token / refresh_token).
"""

import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import User


# ── Configuration ─────────────────────────────────────────────────────────

JWT_SECRET = settings.SECRET_KEY
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_LIFETIME = timedelta(hours=8)
REFRESH_TOKEN_LIFETIME = timedelta(days=7)


# ── Token Generation ──────────────────────────────────────────────────────

def generate_access_token(user):
    """Generate a short-lived access token for a user."""
    now = datetime.now(timezone.utc)
    expires_at = now + ACCESS_TOKEN_LIFETIME
    
    payload = {
        'user_id': user.id,
        'email': user.email,
        'full_name': user.full_name,
        'role': user.role.code if user.role else None,
        'role_name': user.role.name if user.role else None,
        'token_type': 'access',
        'iat': int(now.timestamp()),
        'exp': int(expires_at.timestamp()),
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token, expires_at


def generate_refresh_token(user):
    """Generate a long-lived refresh token for a user."""
    now = datetime.now(timezone.utc)
    expires_at = now + REFRESH_TOKEN_LIFETIME
    
    payload = {
        'user_id': user.id,
        'token_type': 'refresh',
        'iat': int(now.timestamp()),
        'exp': int(expires_at.timestamp()),
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token):
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Token has expired.')
    except jwt.InvalidTokenError:
        raise exceptions.AuthenticationFailed('Invalid token.')


# ── DRF Authentication Class ──────────────────────────────────────────────

class ClientPortalJWTAuthentication(authentication.BaseAuthentication):
    """
    Custom JWT auth class - reads 'Authorization: Bearer <token>' header,
    validates the token, and returns the corresponding user.
    """
    
    keyword = 'Bearer'
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '').strip()
        
        if not auth_header:
            return None  # No credentials — let other auth classes try
        
        parts = auth_header.split()
        
        if parts[0].lower() != self.keyword.lower():
            return None  # Not a Bearer token
        
        if len(parts) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')
        if len(parts) > 2:
            raise exceptions.AuthenticationFailed('Invalid token header. Token should not contain spaces.')
        
        token = parts[1]
        payload = decode_token(token)
        
        if payload.get('token_type') != 'access':
            raise exceptions.AuthenticationFailed('Invalid token type. Expected access token.')
        
        user_id = payload.get('user_id')
        if not user_id:
            raise exceptions.AuthenticationFailed('Invalid token payload.')
        
        try:
            user = User.objects.select_related('role', 'department').get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found.')
        
        if not user.is_active:
            raise exceptions.AuthenticationFailed('User account is deactivated.')
        
        return (user, token)
    
    def authenticate_header(self, request):
        return self.keyword