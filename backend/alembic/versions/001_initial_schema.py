"""Initial Database Schema with 17 Entities, pgvector, and pg_trgm

Revision ID: 001_initial_schema
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Enable extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

    # 1. Researchers
    op.create_table(
        'researchers',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('institution', sa.String(), nullable=True),
        sa.Column('domain_expertise', sa.JSON(), nullable=True),
        sa.Column('total_experiments', sa.Integer(), default=0),
        sa.Column('validated_observations', sa.Integer(), default=0),
        sa.Column('approved_directives', sa.Integer(), default=0),
        sa.Column('rejected_directives', sa.Integer(), default=0),
        sa.Column('reputation_score', sa.Float(), default=1.0),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now())
    )

    # 2. Projects
    op.create_table(
        'projects',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('domain', sa.String(), default='materials_science'),
        sa.Column('meta_info', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now())
    )

    # 3. Experiments
    op.create_table(
        'experiments',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('project_id', sa.String(), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('researcher_id', sa.String(), sa.ForeignKey('researchers.id'), nullable=False),
        sa.Column('experiment_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('experiment_type', sa.String(), default='reaction'),
        sa.Column('status', sa.String(), default='proposed'),
        sa.Column('reaction_smiles', sa.String(), nullable=True),
        sa.Column('source_type', sa.String(), default='RESONA'),
        sa.Column('source_id', sa.String(), nullable=True),
        sa.Column('is_synthetic', sa.Boolean(), default=False),
        sa.Column('meta_info', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now())
    )
    op.create_index('idx_experiments_created_at', 'experiments', ['created_at'])
    op.create_index('idx_experiments_status', 'experiments', ['status'])

    # 4. Experiment Parameters
    op.create_table(
        'experiment_parameters',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('experiment_id', sa.String(), sa.ForeignKey('experiments.id'), nullable=False),
        sa.Column('parameter_name', sa.String(), nullable=False),
        sa.Column('parameter_value', sa.String(), nullable=False),
        sa.Column('numeric_value', sa.Float(), nullable=True),
        sa.Column('unit', sa.String(), nullable=True),
        sa.Column('parameter_type', sa.String(), default='condition'),
        sa.Column('raw_data', sa.JSON(), nullable=True)
    )

    # 5. Experiment Observations
    op.create_table(
        'experiment_observations',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('experiment_id', sa.String(), sa.ForeignKey('experiments.id'), nullable=False),
        sa.Column('observation_type', sa.String(), default='visual'),
        sa.Column('observation_text', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), default=sa.func.now()),
        sa.Column('observed_by', sa.String(), nullable=True),
        sa.Column('meta_info', sa.JSON(), nullable=True)
    )

    # 6. Experiment Outcomes
    op.create_table(
        'experiment_outcomes',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('experiment_id', sa.String(), sa.ForeignKey('experiments.id'), nullable=False, unique=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('yield_percentage', sa.Float(), nullable=True),
        sa.Column('purity_percentage', sa.Float(), nullable=True),
        sa.Column('quality_metrics', sa.JSON(), nullable=True),
        sa.Column('measurements', sa.JSON(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('researcher_interpretation', sa.Text(), nullable=True),
        sa.Column('uncertainty_level', sa.String(), default='low'),
        sa.Column('derived_label', sa.Boolean(), default=False),
        sa.Column('derivation_method', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

    # 7. Pattern Clusters
    op.create_table(
        'pattern_clusters',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('cluster_name', sa.String(), nullable=False),
        sa.Column('cluster_type', sa.String(), default='failure_pattern'),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('algorithm', sa.String(), default='dbscan'),
        sa.Column('supporting_experiments_count', sa.Float(), default=0),
        sa.Column('confidence', sa.Float(), default=0.8),
        sa.Column('supporting_experiment_ids', sa.JSON(), nullable=True),
        sa.Column('meta_info', sa.JSON(), nullable=True),
        sa.Column('first_seen', sa.DateTime(), default=sa.func.now()),
        sa.Column('last_seen', sa.DateTime(), default=sa.func.now())
    )

    # 8. Failure Records
    op.create_table(
        'failure_records',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('experiment_id', sa.String(), sa.ForeignKey('experiments.id'), nullable=False, unique=True),
        sa.Column('failure_category', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(), default='moderate'),
        sa.Column('evidence', sa.Text(), nullable=True),
        sa.Column('researcher_interpretation', sa.Text(), nullable=True),
        sa.Column('confidence_score', sa.Float(), default=0.8),
        sa.Column('cluster_id', sa.String(), sa.ForeignKey('pattern_clusters.id'), nullable=True),
        sa.Column('meta_info', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

    # 9. Hypotheses
    op.create_table(
        'hypotheses',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('statement', sa.Text(), nullable=False),
        sa.Column('status', sa.String(), default='open'),
        sa.Column('supporting_experiments', sa.JSON(), nullable=True),
        sa.Column('refuting_experiments', sa.JSON(), nullable=True),
        sa.Column('created_by', sa.String(), sa.ForeignKey('researchers.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now())
    )

    # 10. Memory Events
    op.create_table(
        'memory_events',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('experiment_id', sa.String(), sa.ForeignKey('experiments.id'), nullable=True),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('hindsight_memory_id', sa.String(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('meta_info', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), default=sa.func.now())
    )

    # 11. Mental Models
    op.create_table(
        'mental_models',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('model_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('supporting_evidence', sa.JSON(), nullable=True),
        sa.Column('confidence', sa.Float(), default=0.7),
        sa.Column('status', sa.String(), default='active'),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now())
    )

    # 12. Directives
    op.create_table(
        'directives',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('directive_text', sa.Text(), nullable=False),
        sa.Column('reasoning', sa.Text(), nullable=False),
        sa.Column('status', sa.String(), default='candidate'),
        sa.Column('confidence', sa.Float(), default=0.8),
        sa.Column('supporting_experiment_ids', sa.JSON(), nullable=True),
        sa.Column('approved_by', sa.String(), sa.ForeignKey('researchers.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now())
    )

    # 13. Experiment Embeddings
    op.create_table(
        'experiment_embeddings',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('experiment_id', sa.String(), sa.ForeignKey('experiments.id'), nullable=False),
        sa.Column('embedding_type', sa.String(), default='description'),
        sa.Column('embedding_vector', sa.JSON(), nullable=False),
        sa.Column('model_version', sa.String(), default='all-MiniLM-L6-v2'),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

    # 14. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('entity_type', sa.String(), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=True),
        sa.Column('source', sa.String(), default='API'),
        sa.Column('is_system_generated', sa.String(), default='false'),
        sa.Column('previous_state', sa.JSON(), nullable=True),
        sa.Column('new_state', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), default=sa.func.now())
    )

    # 15. Counterfactuals
    op.create_table(
        'counterfactuals',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('experiment_id', sa.String(), sa.ForeignKey('experiments.id'), nullable=True),
        sa.Column('original_config', sa.JSON(), nullable=False),
        sa.Column('suggested_modification', sa.JSON(), nullable=False),
        sa.Column('reasoning', sa.Text(), nullable=False),
        sa.Column('supporting_experiment_ids', sa.JSON(), nullable=True),
        sa.Column('historical_evidence_summary', sa.Text(), nullable=True),
        sa.Column('uncertainty_level', sa.String(), default='medium'),
        sa.Column('confidence_score', sa.Float(), default=0.75),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

    # 16. Evidence Records
    op.create_table(
        'evidence_records',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('query_id', sa.String(), nullable=True),
        sa.Column('source_type', sa.String(), nullable=False),
        sa.Column('source_id', sa.String(), nullable=False),
        sa.Column('relevance_score', sa.Float(), default=0.0),
        sa.Column('temporal_relevance', sa.Float(), default=1.0),
        sa.Column('retrieval_method', sa.String(), default='hybrid'),
        sa.Column('evidence_payload', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

    # 17. Researcher Feedback
    op.create_table(
        'researcher_feedback',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('researcher_id', sa.String(), sa.ForeignKey('researchers.id'), nullable=False),
        sa.Column('target_type', sa.String(), nullable=False),
        sa.Column('target_id', sa.String(), nullable=False),
        sa.Column('rating', sa.String(), nullable=False),
        sa.Column('score', sa.Float(), default=1.0),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

def downgrade():
    op.drop_table('researcher_feedback')
    op.drop_table('evidence_records')
    op.drop_table('counterfactuals')
    op.drop_table('audit_logs')
    op.drop_table('experiment_embeddings')
    op.drop_table('directives')
    op.drop_table('mental_models')
    op.drop_table('memory_events')
    op.drop_table('hypotheses')
    op.drop_table('failure_records')
    op.drop_table('pattern_clusters')
    op.drop_table('experiment_outcomes')
    op.drop_table('experiment_observations')
    op.drop_table('experiment_parameters')
    op.drop_table('experiments')
    op.drop_table('projects')
    op.drop_table('researchers')
