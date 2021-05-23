const DBUtills=require("./DButils");

/**
 * This function gets the assosiaction man user
 * @returns assosiation man object
 */
async function getAssosiationMan(){
    return (await DBUtills.execQuery(`SELECT username FROM dbo.Users`))[0];
}
/**
 * This function adds specific game to the system
 * @param {*} game_details game object to add to the system
 */
async function addGameToSystem(game_details){
    await DBUtills.execQuery(`INSERT INTO dbo.Games (gameTime,hostTeam,guestTeam,stadium,referee_id) VALUES ('${game_details.date_and_time}','${game_details.home_team}','${game_details.away_team}','${game_details.stadium}',${game_details.referee_id})`);
}
/**
 * This function adds results to specific game
 * @param {*} game_id the game to add the rsult to
 * @param {*} result result to add
 */
async function addResultToGame(game_id,result){
    await DBUtills.execQuery(`UPDATE dbo.Games SET result='${result}' WHERE id=${game_id}`);
}
/**
 * This function adds a single event to the system
 * @param {*} game_id game id in which the event happened
 * @param {*} event event to add to the system
 */
async function addEventToGame(game_id,event){
    await DBUtills.execQuery(`INSERT INTO dbo.EventsInGame (gameID,eventDateAndTime,eventMinuteInGame,eventType,eventDescription) VALUES (${game_id},'${event.eventDateAndTime}',${event.eventMinuteInGame},'${event.eventType}','${event.eventDescription}')`);
}
/**
 * This function add a referee to the system
 * @param {*} referee referee object to add to the system
 */
async function addRefereeToSystem(referee){
    await DBUtills.execQuery(`INSERT INTO dbo.Referees (fullName,country,email) VALUES ('${referee.fullName}','${referee.country}','${referee.email}')`);
}
/**
 * This function returns all referees avaliable to be assigned to specific game
 * @param {*} game_time time of the game
 * @returns array of avaliable referees
 */
async function getAllFreeRefereesToGame(game_time){
    const free_referees= await DBUtills.execQuery(`SELECT referee_id, fullName FROM dbo.Referees WHERE referee_id NOT IN (SELECT referee_id FROM dbo.Games WHERE gameTime='${game_time}')`);
    return free_referees;
  }

exports.getAssosiationMan=getAssosiationMan;
exports.addGameToSystem=addGameToSystem;
exports.addResultToGame=addResultToGame;
exports.addEventToGame=addEventToGame;
exports.addRefereeToSystem=addRefereeToSystem;
exports.getAllFreeRefereesToGame=getAllFreeRefereesToGame;