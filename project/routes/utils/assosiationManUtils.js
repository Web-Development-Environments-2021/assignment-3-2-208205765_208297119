const DBUtills=require("./DButils");
const team_utils=require("./teams_utils");

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
    await DBUtills.execQuery(`INSERT INTO dbo.Games (gameTime,hostTeam,guestTeam,stadium,referee) VALUES ('${game_details.date_and_time}','${game_details.home_team.toLowerCase()}','${game_details.away_team.toLowerCase()}','${game_details.stadium}','${game_details.referee}')`);
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
   * This function checks if game was already added
   * @param {*} game_details , game object to check
   * @returns true if it was added or false if not
   */
  async function checkIfGameWasAdded(game_details){
    const game=await DBUtills.execQuery(`SELECT * FROM dbo.Games WHERE gameTime='${game_details.date_and_time}' AND hostTeam='${game_details.home_team}' and guestTeam='${game_details.away_team}' and stadium='${game_details.stadium}' and referee='${game_details.referee}' `);
    if(game.length>0){
        return true;
    }
    return false;
  }

  /**
   * This function checks if result was added already to game
   * @param {*} game_id , the id of the game to check
   * @returns  true if result was added or false if not
   */
  async function checkIfResultWasAdded(game_id){
      const game=await DBUtills.execQuery(`select result from dbo.Games where id=${game_id}`);
      if(game[0].result!=null){
          return true;
      }
      return false;
  }

  /**
   * This function checks if event was already added
   * @param {*} event_details , event object to check
   * @param {*} game_id , id of the game that the event belongs to
   * @returns true if the event was added or false if not
   */
  async function checkIfEventWasAdded(event_details,game_id){
      const event= await DBUtills.execQuery(`select * from dbo.EventsInGame where gameID=${game_id} and eventDateAndTime='${event_details.eventDateAndTime}' and eventMinuteInGame=${event_details.eventMinuteInGame} and eventType='${event_details.eventType}' and eventDescription='${event_details.eventDescription}'`);
      if(event.length>0){
          return true;
      }
      return false;
  }

  /**
   * This function checks if team exist
   * @param {*} team_name , name of the team to check
   * @returns true if team exist or false if not
   */
  async function checkIfTeamExist(team_name){
    const teams=await team_utils.getTeamsByName(team_name);
    if(teams.length>0){
        return true;
    }
    return false;
  }

exports.getAssosiationMan=getAssosiationMan;
exports.addGameToSystem=addGameToSystem;
exports.addResultToGame=addResultToGame;
exports.addEventToGame=addEventToGame;
exports.checkIfGameWasAdded=checkIfGameWasAdded;
exports.checkIfResultWasAdded=checkIfResultWasAdded;
exports.checkIfEventWasAdded=checkIfEventWasAdded;
exports.checkIfTeamExist=checkIfTeamExist;