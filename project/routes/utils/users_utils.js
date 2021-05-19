const DButils = require("./DButils");

async function addTeamToFavorites(user_name, team_id) {
  await DButils.execQuery(`INSERT INTO User_favorite_teams values (${team_id},'${user_name}')`);
}

async function getFavoritePlayers(user_name) {
  const player_ids = await DButils.execQuery(
    `select player_id from User_Favorite_players where username='${user_name}'`
  );
  return player_ids;
}


async function addPlayerToFavorites(user_name,player_id){
  await DButils.execQuery(`INSERT INTO User_favorite_players values (${player_id},'${user_name}')`);
}

async function addGameToFavorites(user_name,game_id){
  await DButils.execQuery(`INSERT INTO User_favorite_games values(${game_id},'${user_name}')`);
}

async function getFavoriteTeamsID(user_name){
  const teams_id=await DButils.execQuery(`SELECT team_id FROM User_favorite_teams WHERE username='${user_name}'`);
  return teams_id;
}

async function getFavoriteGamesID(user_name){
  return await DButils.execQuery(`SELECT game_id FROM dbo.User_favorite_games WHERE username='${user_name}'`);
}



exports.addTeamToFavorites=addTeamToFavorites;
exports.getFavoritePlayers = getFavoritePlayers;
exports.addGameToFavorites=addGameToFavorites;
exports.addPlayerToFavorites=addPlayerToFavorites;
exports.getFavoriteTeamsID=getFavoriteTeamsID;
exports.getFavoriteGamesID=getFavoriteGamesID;
