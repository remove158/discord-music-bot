FROM ghcr.io/lavalink-devs/lavalink:4.0.8

# Create a template of the application.yml
COPY application.yml /opt/Lavalink/application.yml.template

# Add an entrypoint script to process the template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]