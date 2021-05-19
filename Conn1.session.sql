DROP TABLE Users;
CREATE TABLE  Users(
    username VARCHAR(255) NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255) NOT NULL
);

CREATE TABLE Games(
    id INTEGER NOT NULL PRIMARY KEY IDENTITY,
    gameTime DATETIME NOT NULL,
    hostTeam VARCHAR(255) NOT NULL,
    guestTeam VARCHAR(255) NOT NULL,
    stadium VARCHAR(255) NOT NULL,
    result VARCHAR(255),
);

CREATE TABLE EventsInGame(
    eventID INTEGER NOT NULL PRIMARY KEY IDENTITY,
    gameID INTEGER NOT NULL,
    eventDate DATE NOT NULL,
    eventHour TIME NOT NULL,
    eventMinuteInGame VARCHAR(255) NOT NULL,
    eventDescription VARCHAR(255) NOT NULL
);

CREATE TABLE User_Favorite_players(
    player_id INTEGER NOT NULL PRIMARY KEY ,
    userName VARCHAR(255) NOT NULL,
  );

  CREATE TABLE User_favorite_teams(
      team_id INTEGER NOT NULL PRIMARY KEY,
      username VARCHAR(255) NOT NULL
  );

  CREATE TABLE User_favorite_games(
      game_id INTEGER NOT NULL PRIMARY KEY,
      username VARCHAR(255) NOT NULL
  );



