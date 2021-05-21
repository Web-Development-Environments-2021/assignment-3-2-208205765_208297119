const DBUtills=require("./DButils");

async function getAssosiationMan(){
    return await DBUtills.execQuery(`SELECT username FROM dbo.Users`)[0];
}

async function addGameToSystem(game_details){
    await DBUtills.execQuery(`INSERT INTO dbo.Games VALUES ('${game_details.home_team}','${game_details.away_team}',${game_details.date},${game_details.hour},'${game_details.stadium}')`);
}

async function addResultToGame(game_id,result){
    await DBUtills.execQuery(`UPDATE dbo.Games SET result='${result}' WHERE id=${game_id}`);
}

async function addEventToGame(game_id,event){
    await DBUtills.execQuery(`INSERT INTO dbo.EventsInGame VALUES (${game_id},${event.eventDate},${event.eventHour},${event.eventMinuteInGame},'${event.eventDescription}')`);
}

async function addRefereeToSystem(referee){
    await DBUtills.execQuery(`INSERT INTO dbo.Referees VALUES ('${referee.fullName}','${referee.country}','${referee.email}')`);
}

async function getAllFreeRefereesToGame(game_time){
    const free_referees= await DBUtills.execQuery(`SELECT referee_id, fullName FROM dbo.Referees WHERE referee_id NOT IN (SELECT referee_id FROM dbo.Games WHERE gameTime=${game_time})`);
    return free_referees;
  }

exports.getAssosiationMan=getAssosiationMan;
exports.addGameToSystem=addGameToSystem;
exports.addResultToGame=addResultToGame;
exports.addEventToGame=addEventToGame;
exports.addRefereeToSystem=addRefereeToSystem;
exports.getAllFreeRefereesToGame=getAllFreeRefereesToGame;