FROM ghcr.io/lavalink-devs/lavalink:4.0.8

# Install gettext-base for envsubst
USER root
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*
USER lavalink

# Create template and entrypoint
COPY application.yml /opt/Lavalink/application.yml.template
COPY --chmod=755 docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]