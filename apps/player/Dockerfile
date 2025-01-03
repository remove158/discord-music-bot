FROM ghcr.io/lavalink-devs/lavalink:4.0.8

# Create a template of the application.yml
COPY application.yml /opt/Lavalink/application.yml.template

# Add an entrypoint script to process the template
COPY --chmod=755 docker-entrypoint.sh /docker-entrypoint.sh

# Environment variables for the application
ENV POT_TOKEN=${POT_TOKEN}
ENV VISITOR_DATA=${VISITOR_DATA}
ENV LAVA_LINK_PASSWORD=${LAVA_LINK_PASSWORD}

ENTRYPOINT ["/docker-entrypoint.sh"]