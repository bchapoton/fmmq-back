# FMMQ Server
**NodeJS** v12.16.1

**MongoDB** MongoDB 4.2.5 Community

## Environment variables

|Name                 |Mandatory|default value|
|---------------------|:-------:|------------:|
|**FMMQ_mongo_db_uri**|yes      |N/A          |
|**FMMQ_private_key** |yes      |N/A          |
|**FMMQ_node_port**   |no       |8080         |


## Installation

```bash
yarn install
```

## Run

```bash
node ./bin/www
```

# Documentation

## Sockets

One socket namespace per game room

### Events

#### From Client

##### ENTER event

Player enter in the game room

**Name** : ENTER

**Payload** :
```json
{
    "id": "player id",
    "nickname": "player nickname",
    "score": 0
}
```

##### GUESSED event

Player try to guessed something

**Name** : GUESSED

**Payload** :
```json
{
    "music": {"artist":  "", "title":  ""},
    "playerId": 1,
    "points": 3,
    "found": "",
    "alreadyFound": "",
    "trophy": 1
}
```

|Field name|type|Possible values|description|
|---------------------|:-------:|:-------:|------------:|
|music|string|ciphered found values|the found values (artist, title or both) ciphered with client key|
|found|string|ARTIST, TITLE, BOTH|defined whats the player found after the try (event if the player find the artist or the title before this try the value will be BOTH, this value is used to update the leaderboard summary)|
|alreadyFound|string|NONE, ARTIST, TITLE|defined whats the player already found before the try (used to update leaderboard summary, combined with the found attribute we will know which leaderboard summary attribute need to be decrement before increment the new one)|
|trophy|int|1, 2, 3|if the user find the both title and artist the first, second or third, none otherwise|


##### FAILED event

Player failed his try

**Name** : FAILED

**Payload** :
```json
{
    "playerId": 1,
    "accuracy": 0.5
}
```

|Field name|type|Possible values|description|
|---------------------|:-------:|:-------:|------------:|
|found|number|between 0 and 1|defined if the player was closed to find with his try or if it is a dumb try|


##### ROUND_STARTS event

Start the round on the current music scheme object

**Name** : ROUND_STARTS

**Payload** :
```json
{
    "fileUrl": "https://.....",
    "currentMusicIndexDisplayed": 1
}
```

|Field name|type|Possible values|description|
|---------------------|:-------:|:-------:|------------:|
|fileUrl|string|url|music url for the round|
|currentMusicIndexDisplayed|int||Current music index from zero for display in room the current scheme progression|


##### ROUND_ENDS event

Ends the round on the current music scheme object

**Name** : ROUND_ENDS

**Payload** :
```json
{
    "music": {
      "artist": "",
      "title": ""
    },
    "nextFile": "https://....."
}
```

|Field name|type|Possible values|description|
|---------------------|:-------:|:-------:|------------:|
|music|object||previous music information|
|nextFile|string|url|next music url for preload purpose|

