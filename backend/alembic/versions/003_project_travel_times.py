"""add_travel_time_to_from_to_projects

Revision ID: 003_project_travel_times
Revises: 002_phase_5_and_6
Create Date: 2026-03-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_project_travel_times'
down_revision: Union[str, None] = '002_phase_5_and_6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('travel_time_to', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('projects', sa.Column('travel_time_from', sa.Integer(), nullable=True, server_default='0'))


def downgrade() -> None:
    op.drop_column('projects', 'travel_time_from')
    op.drop_column('projects', 'travel_time_to')
