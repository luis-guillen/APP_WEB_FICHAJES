"""add project user role

Revision ID: 004
Revises: dc111475b166
Create Date: 2026-04-08 20:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = 'dc111475b166'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Agrega la columna role a la tabla project_users
    op.add_column('project_users', sa.Column('role', sa.String(length=50), nullable=True))
    op.execute("UPDATE project_users SET role = 'PROGRAMADORES'")
    op.alter_column('project_users', 'role', nullable=False)


def downgrade() -> None:
    op.drop_column('project_users', 'role')
