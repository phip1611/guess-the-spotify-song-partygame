# Hackthon

## Idea + Concept
A game with the spotify api. There is a game master that can set a set of songs
in his web ui. Then he can invite players through a link. Hence, everything is a
website/webapp. If all players joined the game master can start the game.

The game master plays the song on his device. From this moment the buzzer buttons
in the web ui on the players devices will be enabled. The fastest player or team can 
make their guess and the game master decides if its correct.

The game master gives points to the team in his web ui.

It's recommended to use a big screen 
where the moderator can show the solutions, which players
has the most points and so on :)

## Learnings
I learned how to work with Web Sockets (with socket.io).
This was my first project with realtime functionality. Quite interesting stuff!


## Build + Run
`$ sh build.sh`\
`$ docker run -p 8080:8080 phip1611:guess-spotify-song-game`

# How to play
Game master visits http://localhost:8080 (or https://domain.tld with reverse proxy)
and starts the game. He should share his display with everyone
 for example on a big TV or a projector. An invitation link for other players will be generated
that looks like this: http://localhost/game/123

The game master himself can participate the game as well if
he joines in with another device.

Giving points to the players is up to the game master.

The only functionality on the players devices is the buzzer button and
of course the selection of a player name.

# Description of protocol between `game master - server`, `player - server`, and `game master <-via server-> player`.
(See common-ts/socket-events.ts)
## Server
- listens on all new sockets for either `GM_CREATE_GAME(gameId: string)` or `PLAYER_HELLO(gameId: string)`
- associates all this sockets a uuid and adds the socket to the sockets of a internal Game-object
- returns `SERVER_CONFIRM(uuid: string)`
- this uuid can be used for either `GM_RECONNECT(uuid: string)` or `PLAYER_RECONNECT(uuid: string)` so that
  the sockets will be attached to the internal Game-object
- server returns `SERVER_CONFIRM(uuid: string)` also after reconnects (with same uuid)
- forward GM to Player: `GM_ENABLE_BUZZER()`, `GM_START_NEXT_ROUND
- forward Player to GM: `PLAYER_REGISTER(userName: string)`, `PLAYER_BUZZER()`
## Game master
- Sends event `GM_CREATE_GAME(gameId: string)` and receives `SERVER_CONFIRM(uuid: string)`
- or sends `GM_RECONNECT(uuid: string)` and receives `SERVER_CONFIRM(uuid: string)`
---
- sends `GM_START_NEXT_ROUND()`, `GM_ENABLE_BUZZER()` ...
## Player
- Sends event `PLAYER_HELLO(gameId: string)` and receives `SERVER_CONFIRM(uuid: string)`
- or sends `PLAYER_RECONNECT(uuid: string)` and receives `SERVER_CONFIRM(uuid: string)`
- if not done yet: sends `PLAYER_REGISTER(userName: string)` to game master
- send `PLAYER_BUZZER()` again and again..