FROM ghcr.io/lavalink-devs/lavalink:4.2.1

# install envsubst
USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext-base \
    && rm -rf /var/lib/apt/lists/*

# disable native crypto (fix ARM libdave issue)
ENV JAVA_TOOL_OPTIONS="-Dlava.native=false -XX:+UseG1GC -XX:MaxRAMPercentage=75"

USER lavalink

# config template
COPY application.yml /opt/Lavalink/application.yml.template

# entrypoint
COPY --chmod=755 docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]