#!/bin/bash

# start_all.sh
# Script to build, start and seed the application using Docker

echo "🚀 Starting TimeFlow App with Docker..."

# 1. Build and start containers
echo "📦 Building and starting containers..."
docker compose up --build -d

# 2. Wait for backend to be ready
echo "⏳ Waiting for backend to be ready (migrations, etc.)..."
# Give it a bit of time for migrations to run in the entrypoint
sleep 5

# 3. Seed data
echo "🌱 Seeding Demo data..."
docker compose exec backend bash -c "export PYTHONPATH=/app && python scripts/seeds/seed_demo.py"

echo "🌱 Seeding Mango project data..."
docker compose exec backend bash -c "export PYTHONPATH=/app && python scripts/seeds/seed_mango.py"

# 4. Create Antonio user (optional but matches user request history)
echo "👤 Creating user 'antonio'..."
docker compose exec backend python -c "from app.database.session import SessionLocal; from app.models.user import User; from app.models.project import Project; from app.auth.security import get_password_hash; db=SessionLocal(); u=db.query(User).filter(User.employee_code=='antonio').first(); (u.setattr('password_hash', get_password_hash('antonio123')) if u else db.add(User(employee_code='antonio', name='Antonio Admin', password_hash=get_password_hash('antonio123'), role='Montadores', is_admin=False, home_location='Oficina'))); p=db.query(Project).filter(Project.code=='3025').first(); (p.users.append(u) if u and p and u not in p.users else None); db.commit(); print('✅ antonio ready with role Montador and project Mango assigned')"

echo ""
echo "✨ Everything is up and running!"
echo "🔗 Frontend: http://localhost"
echo "🔗 API Docs: http://localhost:8000/docs"
echo ""
echo "Logs can be followed with: docker compose logs -f"
