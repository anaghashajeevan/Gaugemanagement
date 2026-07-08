"""
Seed Departments data for Gauge Calibration System.

Run this script from project root:
    python gaugecaliberationapp/seed_departments.py
    python gaugecaliberationapp/seed_departments.py --clear
"""

import os
import sys
import django
import argparse

# ── Setup Django ──
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Gaugecaliberation.settings')
django.setup()

# ── Now import models ──
from gaugecaliberationapp.models import Department, User


# ═════════════════════════════════════════════════════════════════════
# DEPARTMENT SEED DATA
# ═════════════════════════════════════════════════════════════════════

DEPARTMENTS_DATA = [
    {'name': 'Quality Control',  'location_type': 'gauge_room', 'is_active': True},
    {'name': 'Production',       'location_type': 'shop_floor', 'is_active': True},
    {'name': 'Gauge Room',       'location_type': 'gauge_room', 'is_active': True},
    {'name': 'Maintenance',      'location_type': 'other',      'is_active': True},
    {'name': 'Stores',           'location_type': 'store',      'is_active': True},
]


# ═════════════════════════════════════════════════════════════════════
# CLEAR EXISTING DEPARTMENTS
# ═════════════════════════════════════════════════════════════════════

def clear_departments():
    """Delete all departments. Unlinks users first to avoid protect errors."""
    print("🗑  Clearing existing departments...")

    # Unlink any users that reference departments (avoids FK protect errors)
    unlinked = User.objects.filter(department__isnull=False).update(department=None)
    if unlinked > 0:
        print(f"  ✓ Unlinked {unlinked} user(s) from departments")

    # Delete all departments
    dept_count = Department.objects.count()
    Department.objects.all().delete()
    print(f"  ✓ Deleted {dept_count} department(s)\n")


# ═════════════════════════════════════════════════════════════════════
# SEED DEPARTMENTS
# ═════════════════════════════════════════════════════════════════════

def seed_departments():
    print("🏢 Seeding Departments...")
    created_count = 0
    updated_count = 0

    for dept_data in DEPARTMENTS_DATA:
        dept, created = Department.objects.update_or_create(
            name=dept_data['name'],
            defaults={
                'location_type': dept_data['location_type'],
                'is_active':     dept_data['is_active'],
            }
        )
        if created:
            created_count += 1
            print(f"  ✓ Created: {dept.name} ({dept.location_type})")
        else:
            updated_count += 1
            print(f"  ↻ Updated: {dept.name} ({dept.location_type})")

    print(f"\n  Summary: {created_count} created, {updated_count} updated")


# ═════════════════════════════════════════════════════════════════════
# VERIFY
# ═════════════════════════════════════════════════════════════════════

def verify_departments():
    print("\n" + "=" * 60)
    print("📊 DEPARTMENTS IN DATABASE")
    print("=" * 60)

    departments = Department.objects.all().order_by('id')

    if not departments.exists():
        print("  (No departments found)")
        return

    print(f"\n  {'ID':<5} {'Name':<22} {'Location Type':<15} {'Active'}")
    print(f"  {'-' * 5} {'-' * 22} {'-' * 15} {'-' * 8}")

    for d in departments:
        print(f"  {d.id:<5} {d.name:<22} {d.location_type:<15} {d.is_active}")

    print(f"\n  Total: {departments.count()} departments")


# ═════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════

def run(clear=False):
    print("\n" + "=" * 60)
    print("🌱 GAUGE CALIBRATION — DEPARTMENT SEEDER")
    print("=" * 60 + "\n")

    if clear:
        clear_departments()

    seed_departments()
    verify_departments()

    print("\n" + "=" * 60)
    print("✅ DONE")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Refresh your React app")
    print("  2. Departments dropdown will populate with these 5 departments")
    print("  3. Frontend location seed data will match these department names")
    print()


# ═════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Seed Departments for Gauge Calibration System',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Add departments (skips duplicates by name, updates existing)
    python gaugecaliberationapp/seed_departments.py

    # Clear ALL existing departments first, then seed fresh
    python gaugecaliberationapp/seed_departments.py --clear
        """
    )

    parser.add_argument(
        '--clear',
        action='store_true',
        help='Clear ALL existing departments before seeding (unlinks users first)',
    )

    args = parser.parse_args()

    run(clear=args.clear)