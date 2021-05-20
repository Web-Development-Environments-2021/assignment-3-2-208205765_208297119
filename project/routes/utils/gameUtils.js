const DButils=require("./DButils");


async function getGamesOfTeam(team_id){
    let future_games = await DButils.execQuery(`SELECT gameTime,hostTeam,guestTeam,stadium FROM dbo.Games WHERE (hostTeam=${team_id} OR guestTeam=${team_id}) AND gameTime>=GETDATE()`);
    let past_games= await DButils.execQuery(`SELECT id,gameTime,hostTeam,guestTeam,stadium,result FROM dbo.Games WHERE (hostTeam=${team_id} OR guestTeam=${team_id}) AND gameTime<GETDATE()`);
    return await getFutureAndPastGamesObject(past_games,future_games);
}

async function getFutureAndPastGamesObject(past_games,future_games){
    let past_games_arr_to_return=[];
    let future_games_Arr_to_return=[];
    for(let i=0;i<past_games.length;i++){
        let events_arr=[];
        let gameEvents=await DButils.execQuery(`SELECT eventDate,eventHour,eventMinute,eventDescription FROM dbo.EventsInGame WHERE gameID=${past_games[i].id} `);
        for(let j=0;j<gameEvents.length;j++){
            events_arr.push({
                date: gameEvents[j].eventDate,
                hour: gameEvents[j].eventHour,
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
        future_games_Arr_to_return.push(createGameObject(future_games[i],team_games));
    }
    return {
        future_games_arr: future_games_Arr_to_return,
        past_games_arr: past_games_arr_to_return
    };
}

function createGameObject(game){
    let gameDate=new Date(game.gameTime);
    let dateOfTheGame=(gameDate.getDate()).toString()+"/"+(gameDate.getMonth()+1).toString()+"/"+gameDate.getFullYear().toString();
    let time= gameDate.getHours().toString+"/"+gameDate.getMinutes().toString();
   return{
        home_team: game.hostTeam,
        away_team: game.guestTeam,
        date: dateOfTheGame,
        hour: time,
        stadium: game.stadium,
     };
}

async function getNearestGame(){
    let games= await DButils.execQuery(`SELECT gameTime,hostTeam,guestTeam,stadium FROM dbo.Games WHERE gameTime>=GETDATE()`);
    let nearestGame=null;
    let diff = 100000000;
    let currentDate=new Date();
    for(let i=0;i<games.length;i++){
        let gameDate=new Date(games[i].gameTime);
        if((gameDate-currentDate)<diff){
            diff=gameDate-currentDate;
            nearestGame=games[i];
        }
    }
    return createGameObject(nearestGame);
}

async function getGameDetailsByID(game_id){
    const game=await DButils.execQuery(`SELECT gameTime,hostTeam,guestTeam,stadium FROM dbo.Games WHERE id=${game_id}`);
    return createGameObject(game);
}

async function deletePlayedGames(user_name){
    // delete favorite games that were already played
    await DButils.execQuery(`DELETE FROM User_favorite_teams WHERE GETDATE()>gameTime AND username='${user_name}'`);
}

async function getThreeNextGames(user_name){
    const games=await DButils.execQuery(`SELECT gameTime,hostTeam,guestTeam,stadium FROM dbo.Games INNER JOIN dbo.User_favorite_games ON dbo.Games.id=dbo.User_favorite_games.game_id WHERE (gameTime>GETDATE() AND username='${user_name}')`);
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
    const future_games=await DButils.execQuery(`SELECT gameTime,hostTeam,guestTeam,stadium FROM dbo.Games WHERE gameTime>=GETDATE()`);
    const past_games= await DButils.execQuery(`id,gameTime,hostTeam,guestTeam,stadium,result FROM dbo.Games WHERE gameTime<GETDATE()`);
    return await getFutureAndPastGamesObject(past_games,future_games);
}

exports.getGamesOfTeam=getGamesOfTeam;
exports.getNearestGame=getNearestGame;
exports.deletePlayedGames=deletePlayedGames;
exports.getGameDetailsByID=getGameDetailsByID;
exports.getThreeNextGames=getThreeNextGames;
exports.getGamesOfCurrentStage=getGamesOfCurrentStage;