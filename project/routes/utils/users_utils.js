const DButils = require("./DButils");

/**
 * This function adds a given team to user's favorites
 * @param {*} user_name, user name of the user to add the team to his favorites
 * @param {*} team_id, id of the team to add
 */
async function addTeamToFavorites(user_name, team_id) {
  await DButils.execQuery(`INSERT INTO User_favorite_teams (team_id,username) values (${team_id},'${user_name}')`);
}

/**
 * This function returns all favorite players of given user
 * @param {*} user_name, username of the user to return his favorite players
 * @returns an array with user's favorite players
 */
async function getFavoritePlayers(user_name) {
  const player_ids = await DButils.execQuery(
    `select player_id from User_Favorite_players where username='${user_name}'`
  );
  return player_ids;
}

/**
 * This function adds a player to user's favorites players
 * @param {*} user_name, the username of the user to whom to add the player
 * @param {*} player_id, id of the player to add
 */
async function addPlayerToFavorites(user_name,player_id){
  await DButils.execQuery(`INSERT INTO User_favorite_players (player_id,username) values (${player_id},'${user_name}')`);
}

/**
 * This function adds a game to user's favorites games
 * @param {*} user_name, user_name the username of the user to whom to add the game
 * @param {*} game_id, id of the game to add
 */
async function addGameToFavorites(user_name,game_id){
  await DButils.execQuery(`INSERT INTO User_favorite_games (game_id,username) values(${game_id},'${user_name}')`);
}

/**
 * This function returns all favorite teams of given user
 * @param {*} user_name, username of the user to return his favorite teams
 * @returns an array with user's favorite teams
 */
async function getFavoriteTeamsID(user_name){
  const teams_id=await DButils.execQuery(`SELECT team_id FROM User_favorite_teams WHERE username='${user_name}'`);
  return teams_id;
}

/**
 * This function returns all favorite games of given user
 * @param {*} user_name , username of the user to return his favorite games
 * @returns an array with user's favorite games
 */
async function getFavoriteGamesID(user_name){
  return await DButils.execQuery(`SELECT game_id FROM dbo.User_favorite_games WHERE username='${user_name}'`);
}



exports.addTeamToFavorites=addTeamToFavorites;
exports.getFavoritePlayers = getFavoritePlayers;
exports.addGameToFavorites=addGameToFavorites;
exports.addPlayerToFavorites=addPlayerToFavorites;
exports.getFavoriteTeamsID=getFavoriteTeamsID;
exports.getFavoriteGamesID=getFavoriteGamesID;
