const DButils = require("./DButils");

async function markPlayerAsFavorite(user_name, team_id) {
  await DButils.execQuery(
    `insert into User_Preferences values ('${user_name}',${team_id},'team')`
  );
}

async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from FavoritePlayers where user_id='${user_id}'`
  );
  return player_ids;
}



exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
