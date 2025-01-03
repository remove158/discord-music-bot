#!/bin/sh

# Replace environment variables in the template
envsubst < /opt/Lavalink/application.yml.template > /opt/Lavalink/application.yml

# Start Lavalink
exec java -Djdk.tls.client.protocols=TLSv1.2 -jar Lavalink.jar
