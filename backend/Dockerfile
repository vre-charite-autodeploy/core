# The builder image, used to build the virtual environment
FROM python:3.8 AS venv-builder

RUN apt update && \
    apt upgrade -y && \
    apt install libldap2-dev libsasl2-dev libldap-2.5-0 git nano vim -y && \
    rm -rf /var/lib/apt/lists/*

RUN pip install poetry==1.8.3

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

COPY pyproject.toml poetry.lock ./

# Use ARG for local builds and --mount=type=secret for CI
ARG GITHUB_TOKEN
RUN --mount=type=secret,id=GIT_AUTH_TOKEN \
    GITHUB_TOKEN=${GITHUB_TOKEN:-$(cat /run/secrets/GIT_AUTH_TOKEN 2>/dev/null || echo '')} && \
    if [ -n "$GITHUB_TOKEN" ]; then \
      git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"; \
    fi && \
    poetry install --only main --no-root --verbose && \
    if [ -n "$GITHUB_TOKEN" ]; then \
      git config --global --unset url."https://${GITHUB_TOKEN}@github.com/".insteadOf; \
    fi

# The runtime image, using the venv that has been built before
FROM python:3.8-slim-bookworm AS runtime

WORKDIR /app

RUN apt update && \
    apt upgrade -y && \
    apt install libldap-2.5-0 -y && \
    rm -rf /var/lib/apt/lists/*

ENV TZ=UTC \
    VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:${PATH}"

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY --from=venv-builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

COPY . ./

RUN mv /app/mc /usr/local/bin/mc && \
    chmod +x /usr/local/bin/mc && \
    chmod +x gunicorn_starter.sh

CMD ["sh", "-c", "mc alias set minio $MINIO_URI_ENDPOINT $MINIO_TENANT_ROOT_USER $MINIO_TENANT_ROOT_PASS --api s3v4 && ./gunicorn_starter.sh"]
