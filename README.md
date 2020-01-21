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

## Build + Run
$ sh build.sh
$ docker run -p 8080:8080 phip1611:guess-spotify-song-game
