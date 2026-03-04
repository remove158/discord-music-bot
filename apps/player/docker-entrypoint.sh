#!/bin/sh
set -e

TEMPLATE="/opt/Lavalink/application.yml.template"
CONFIG="/opt/Lavalink/application.yml"

# ensure template exists
if [ ! -f "$TEMPLATE" ]; then
  echo "application.yml.template not found!"
  exit 1
fi

# render config
envsubst < "$TEMPLATE" > "$CONFIG"

echo "Generated Lavalink config:"
cat "$CONFIG"

# start Lavalink
exec java $JAVA_TOOL_OPTIONS -Djdk.tls.client.protocols=TLSv1.2 -jar /opt/Lavalink/Lavalink.jar