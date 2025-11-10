from logging.config import fileConfig
import os
from sqlalchemy import create_engine

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from app.core.database import SQLALCHEMY_DATABASE_URL, Base

from alembic import context

import app.models

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# If the runtime environment provides DATABASE_URL prefer it over the ini file
# Do NOT set the option through config.set_main_option because configparser
# will try to interpolate '%' characters in the value and raise. Instead,
# compute a local sqlalchemy_url and use it below directly when creating
# an Engine.
env_db = os.getenv("DATABASE_URL")
if env_db:
    sqlalchemy_url = env_db
else:
    sqlalchemy_url = config.get_main_option("sqlalchemy.url")

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = sqlalchemy_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # If we have a runtime URL prefer it; otherwise fall back to the ini file
    if sqlalchemy_url:
        connectable = create_engine(sqlalchemy_url, poolclass=pool.NullPool)
    else:
        # fallback to config-driven engine
        connectable = engine_from_config(
            config.get_section(config.config_ini_section, {}),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True  # IMPORTANT for SQLite ALTER handling
        )

        with context.begin_transaction():
            context.run_migrations()



if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
