"""Run: python seed_data.py"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Gaugecaliberation.settings')
django.setup()

from gaugecaliberationapp.models import Role, Department, User


def seed():
    # Roles
    roles_data = [
        {'code': 'admin', 'name': 'Admin', 'level': 100,
         'description': 'Full system access - manages all data and users'},
        {'code': 'quality_engineer', 'name': 'Quality Engineer', 'level': 75,
         'description': 'Performs calibration, MSA studies, manages CAPA'},
        {'code': 'store_keeper', 'name': 'Store Keeper', 'level': 50,
         'description': 'Manages gauge issue/return and external dispatch'},
        {'code': 'shop_floor_operator', 'name': 'Shop Floor Operator', 'level': 25,
         'description': 'Read-only access - views issued gauges'},
    ]
    for data in roles_data:
        Role.objects.get_or_create(code=data['code'], defaults=data)
    print(f'✓ {Role.objects.count()} roles ready')
    
    # Departments
    departments_data = [
        {'name': 'Quality Assurance', 'location_type': 'gauge_room'},
        {'name': 'Gauge Store', 'location_type': 'store'},
        {'name': 'Shop Floor - Line 1', 'location_type': 'shop_floor'},
        {'name': 'Shop Floor - Line 2', 'location_type': 'shop_floor'},
        {'name': 'IT / Admin', 'location_type': 'other'},
    ]
    for data in departments_data:
        Department.objects.get_or_create(name=data['name'], defaults=data)
    print(f'✓ {Department.objects.count()} departments ready')
    
    # Users
    admin_role = Role.objects.get(code='admin')
    qe_role = Role.objects.get(code='quality_engineer')
    sk_role = Role.objects.get(code='store_keeper')
    op_role = Role.objects.get(code='shop_floor_operator')
    
    it_dept = Department.objects.get(name='IT / Admin')
    qa_dept = Department.objects.get(name='Quality Assurance')
    store_dept = Department.objects.get(name='Gauge Store')
    line1 = Department.objects.get(name='Shop Floor - Line 1')
    
    users_data = [
        {'email': 'admin@company.com', 'full_name': 'System Administrator',
         'role': admin_role, 'department': it_dept, 'password': 'admin123',
         'is_staff': True, 'is_superuser': True},
        {'email': 'priya@company.com', 'full_name': 'Priya Sharma',
         'role': qe_role, 'department': qa_dept, 'password': 'quality123'},
        {'email': 'suresh@company.com', 'full_name': 'Suresh Patil',
         'role': sk_role, 'department': store_dept, 'password': 'store123'},
        {'email': 'ramesh@company.com', 'full_name': 'Ramesh Kumar',
         'role': op_role, 'department': line1, 'password': 'operator123'},
    ]
    
    for data in users_data:
        password = data.pop('password')
        user, created = User.objects.get_or_create(email=data['email'], defaults=data)
        if created:
            user.set_password(password)
            user.must_change_password = False
            user.save()
            print(f'  → Created: {user.email} / {password}')
    
    print(f'✓ {User.objects.count()} users total')
    print('\n=== SEED COMPLETE ===')
    print('Login credentials (email / password):')
    print('  admin@company.com    / admin123')
    print('  priya@company.com    / quality123')
    print('  suresh@company.com   / store123')
    print('  ramesh@company.com   / operator123')


if __name__ == '__main__':
    seed()