const DButils=require("./DButils");

/**
 * This function get all team's games
 * @param {*} team_name  team name to search
 * @returns an array with future and past games
 */
async function getGamesOfTeam(team_name){
    let future_games = await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,hostTeam,guestTeam,stadium,fullName FROM dbo.Games INNER JOIN dbo.Referees ON dbo.Games.referee_id=dbo.Referees.referee_id WHERE (hostTeam='${team_name}' OR guestTeam='${team_name}') AND gameTime>=GETDATE()`);
    let past_games= await DButils.execQuery(`SELECT id,CONVERT(VARCHAR,gameTime,120) AS gameTime,hostTeam,guestTeam,stadium,result,fullName FROM dbo.Games INNER JOIN dbo.Referees ON dbo.Games.referee_id=dbo.Referees.referee_id WHERE (hostTeam='${team_name}' OR guestTeam='${team_name}') AND gameTime<GETDATE()`);
    return await getFutureAndPastGamesObject(past_games,future_games);
}

async function getFutureAndPastGamesObject(past_games,future_games){
    let past_games_arr_to_return=[];
    let future_games_Arr_to_return=[];
    for(let i=0;i<past_games.length;i++){
        let events_arr=[];
        let gameEvents=await DButils.execQuery(`SELECT CONVERT(VARCHAR,eventDateAndTime,120) AS eventDateAndTime,eventMinuteInGame,eventType,eventDescription FROM dbo.EventsInGame WHERE gameID=${past_games[i].id} `);
        for(let j=0;j<gameEvents.length;j++){
            const eventDateAndTime=createTimeInVisibaleFormat(gameEvents[i].eventDateAndTime);
            events_arr.push({
                date: eventDateAndTime[0],
                hour: eventDateAndTime[1],
                minute_in_game: gameEvents[j].eventMinute,
                event_description: gameEvents[j].eventDescription
            });
        }
        let gameObj=createGameObject(past_games[i]);
        gameObj.result=past_games[i].result;
        gameObj.events_schedule=events_arr;
        past_games_arr_to_return.push(gameObj);
    }
    for(let i=0;i<future_games.length;i++){
        future_games_Arr_to_return.push(createGameObject(future_games[i]));
    }
    return {
        future_games_arr: future_games_Arr_to_return,
        past_games_arr: past_games_arr_to_return
    };
}

function createGameObject(game){
    let gameDate=createTimeInVisibaleFormat(game.gameTime);
    let dateOfTheGame=gameDate[0];
    let time= gameDate[1];
   return{
        home_team: game.hostTeam,
        away_team: game.guestTeam,
        date: dateOfTheGame,
        hour: time,
        stadium: game.stadium,
        referee_name: game.fullName
     };
}

function createTimeInVisibaleFormat(date_and_time){
    let timeObject=new Date(date_and_time);
    let dateOfTheGame=(timeObject.getDate()).toString()+"/"+(timeObject.getMonth()+1).toString()+"/"+timeObject.getFullYear().toString();
    let time= timeObject.getHours().toString()+":"+timeObject.getMinutes().toString();
    return [dateOfTheGame,time];
}

async function getNearestGame(){
    let games= await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,hostTeam,guestTeam,stadium,fullName FROM dbo.Games INNER JOIN dbo.Referees ON dbo.Games.referee_id=dbo.Referees.referee_id WHERE gameTime>=GETDATE()`);
    if(games.length==0){
        return null;
    }
    let nearestGame=null;
    let diff = 100000000;
    let currentDate=new Date();
    for(let i=0;i<games.length;i++){
        let gameDate=new Date(games[i].gameTime);
        let differrenceInDays=Math.ceil((gameDate-currentDate)/(1000*60*60*24));
        if(differrenceInDays<diff){
            diff=gameDate-currentDate;
            nearestGame=games[i];
        }
    }
    return createGameObject(nearestGame);
}

async function getGameDetailsByID(game_id){
    const game=await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,hostTeam,guestTeam,stadium,fullName FROM dbo.Games INNER JOIN dbo.Referees ON dbo.Games.referee_id=dbo.Referees.referee_id WHERE id=${game_id}`);
    return createGameObject(game[0]);
}

async function deletePlayedGames(){
    // delete favorite games that were already played
    await DButils.execQuery(`DELETE FROM User_favorite_games WHERE game_id IN (SELECT id FROM dbo.Games WHERE GETDATE()>gameTime)`);
}

async function getThreeNextGames(user_name){
    const games=await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,hostTeam,guestTeam,stadium,fullName FROM dbo.Games INNER JOIN dbo.User_favorite_games ON dbo.Games.id=dbo.User_favorite_games.game_id INNER JOIN dbo.Referees ON dbo.Games.referee_id=dbo.Referees.referee_id WHERE (gameTime>GETDATE() AND username='${user_name}')`);
    if(games.length==0){
        return [];
    }
    let games_arr=[];
    let bound=0;
    if(games.length>3){
        bound =3;
    }
    else{
        bound=games.length;
    }
    for(let i=0;i<bound;i++){
        games_arr.push(createGameObject(games[i]));
    }
    return games_arr;
}

async function getGamesOfCurrentStage(){
    const future_games=await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,hostTeam,guestTeam,stadium, fullName FROM dbo.Games INNER JOIN dbo.Referees ON dbo.Games.referee_id=dbo.Referees.referee_id WHERE gameTime>=GETDATE()`);
    const past_games= await DButils.execQuery(`SELECT id,CONVERT(VARCHAR,gameTime,120) AS gameTime,hostTeam,guestTeam,stadium,result,fullName FROM dbo.Games INNER JOIN dbo.Referees ON dbo.Games.referee_id=dbo.Referees.referee_id WHERE gameTime<GETDATE()`);
    return await getFutureAndPastGamesObject(past_games,future_games);
}

async function checkIfGameWasPlayed(game_id){
    return (await DButils.execQuery(`SELECT * FROM dbo.Games WHERE id=${game_id} AND gameTime<GETDATE()`)).length>0;
}

exports.getGamesOfTeam=getGamesOfTeam;
exports.getNearestGame=getNearestGame;
exports.deletePlayedGames=deletePlayedGames;
exports.getGameDetailsByID=getGameDetailsByID;
exports.getThreeNextGames=getThreeNextGames;
exports.getGamesOfCurrentStage=getGamesOfCurrentStage;
exports.checkIfGameWasPlayed=checkIfGameWasPlayed;