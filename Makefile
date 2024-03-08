image_name = remove158/discord
lavalink = ghcr.io/lavalink-devs/lavalink:4
network = discord

init:
	sudo docker network create -d bridge $(network)

build:
	sudo docker build . -t $(image_name)

player:
	sudo docker run -d --name player --network=$(network) -e SERVER_PORT=2333 -e SERVER_ADDRESS=0.0.0.0 -e LAVALINK_SERVER_PASSWORD=password  $(lavalink)
	sudo docker run -d --name player2 --network=$(network) -e SERVER_PORT=2333 -e SERVER_ADDRESS=0.0.0.0 -e LAVALINK_SERVER_PASSWORD=password  $(lavalink)

discord:
	sudo docker rm -f discord &&  sudo docker run  --name discord --network=$(network) -d  -e LAVALINKNODES="$(LAVALINKNODES)" -e DISCORD_TOKEN=$(DISCORD_TOKEN) -e CLIENT_ID=$(CLIENT_ID)  $(image_name)
