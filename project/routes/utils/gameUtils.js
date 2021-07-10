const DButils=require("./DButils");

/**
 * This function get all team's games
 * @param {*} team_name  team name to search
 * @returns an array with future and past games
 */
async function getGamesOfTeam(team_name){
    tean_name=team_name.toLowerCase()
    let future_games = await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,id,hostTeam,guestTeam,stadium,referee FROM dbo.Games  WHERE (hostTeam='${team_name}' OR guestTeam='${team_name}') AND gameTime>=GETDATE()`);
    let past_games= await DButils.execQuery(`SELECT id,CONVERT(VARCHAR,gameTime,120) AS gameTime,hostTeam,guestTeam,stadium,result,referee FROM dbo.Games  WHERE (hostTeam='${team_name}' OR guestTeam='${team_name}') AND gameTime<GETDATE()`);
    return await getFutureAndPastGamesObject(past_games,future_games);
}

/**
 * This function creates future and past games object
 * @param {*} past_games , array with past games records
 * @param {*} future_games , array with future games reccords
 * @returns an object contains past and future games arrays with relevant data
 */
async function getFutureAndPastGamesObject(past_games,future_games){
    let past_games_arr_to_return=[];
    let future_games_Arr_to_return=[];
    for(let i=0;i<past_games.length;i++){//loop through all past games and gets event schedule of each game
        let events_arr=[];
        let gameEvents=await DButils.execQuery(`SELECT CONVERT(VARCHAR,eventDateAndTime,120) AS eventDateAndTime,eventMinuteInGame,eventType,eventDescription FROM dbo.EventsInGame WHERE gameID=${past_games[i].id} `);
        for(let j=0;j<gameEvents.length;j++){//extract relevant data from each event
            const eventDateAndTime=createTimeInVisibaleFormat(gameEvents[j].eventDateAndTime);
            events_arr.push({
                date: eventDateAndTime[0],
                hour: eventDateAndTime[1],
                minute_in_game: gameEvents[j].eventMinuteInGame,
                event_description: gameEvents[j].eventDescription
            });
        }
        let gameObj=createGameObject(past_games[i]);//creapte past game object
        //add result and event schedule to past game
        gameObj.result=past_games[i].result;
        gameObj.events_schedule=events_arr;
        past_games_arr_to_return.push(gameObj);
    }
    for(let i=0;i<future_games.length;i++){//create future game object from all future games
        future_games_Arr_to_return.push(createGameObject(future_games[i]));
    }
    return {
        future_games_arr: future_games_Arr_to_return,
        past_games_arr: past_games_arr_to_return
    };
}
/**
 * This function creates single game object with relevant data
 * @param {*} game ,game object
 * @returns game object with relevant data
 */
function createGameObject(game){
    let gameDate=createTimeInVisibaleFormat(game.gameTime);//make the time in readable format
    let dateOfTheGame=gameDate[0];
    let time= gameDate[1];//hour of the game
   return{
        id:game.id,
        home_team: game.hostTeam,
        away_team: game.guestTeam,
        date: dateOfTheGame,
        hour: time,
        stadium: game.stadium,
        referee_name: game.referee
     };
}

/**
 * This function converts the time from sql date time object to readable format
 * @param {*} date_and_time , sql datetime object
 * @returns an array that holds in first place the date of the game and in second place the time of the game
 */
function createTimeInVisibaleFormat(date_and_time){
    let timeObject=new Date(date_and_time);
    let dateOfTheGame=(timeObject.getDate()).toString()+"/"+(timeObject.getMonth()+1).toString()+"/"+timeObject.getFullYear().toString();
    let time= String(timeObject.getHours()).padStart(2,"0")+":"+String(timeObject.getMinutes()).padStart(2,"0");
    return [dateOfTheGame,time];
}

/**
 * This function gets the nearest game to be played
 * @returns returns nearest game object or null if doesn't exist
 */
async function getNearestGame(){
    //select future games
    let games= await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,id,hostTeam,guestTeam,stadium,referee FROM dbo.Games  WHERE gameTime>=GETDATE()`);
    if(games.length==0){
        return null;
    }
    let nearestGame=games[0];
    let currentDate=new Date();
    let gameDate=new Date(games[0].gameTime)
    let diff = gameDate-currentDate
    for(let i=1;i<games.length;i++){//loop over all future games and choose the nearest game
        gameDate=new Date(games[i].gameTime);
        let differrenceBetweenDates=gameDate-currentDate;
        if(differrenceBetweenDates<diff){
            diff=differrenceBetweenDates;
            nearestGame=games[i];
        }
    }
    return createGameObject(nearestGame);
}

/**
 * This function creates game object by game id
 * @param {*} game_id id of the game to return it's details
 * @returns game object with relevant details
 */
async function getGameDetailsByID(game_id){
    const game=await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,id,hostTeam,guestTeam,stadium,referee FROM dbo.Games  WHERE id=${game_id}`);
    return createGameObject(game[0]);
}

/**
 * This function deletes all played games from user's favorite games table
 */
async function deletePlayedGames(){
    // delete favorite games that were already played
    await DButils.execQuery(`DELETE FROM User_favorite_games WHERE game_id IN (SELECT id FROM dbo.Games WHERE GETDATE()>gameTime)`);
}

/**
 * This function return user's three future games if user has more than 3 games or the number of user's future games if user has less
 * than 3 favorite games
 * @param {*} user_name ,user name to get his future games
 * @returns an array of future games
 */
async function getThreeNextGames(user_name){
    //get user's favorite games
    const games=await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,game_id,hostTeam,guestTeam,stadium,referee FROM dbo.Games INNER JOIN dbo.User_favorite_games ON dbo.Games.id=dbo.User_favorite_games.game_id  WHERE (gameTime>GETDATE() AND username='${user_name}')`);
    if(games.length==0){// if no favorite games
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
    for(let i=0;i<bound;i++){//create games object
        games_arr.push(createGameObject(games[i]));
    }
    return games_arr;
}

/**
 * This function returns all games of the system
 * @returns an array of future and past games
 */
async function getGamesOfCurrentStage(){
    const future_games=await DButils.execQuery(`SELECT CONVERT(VARCHAR,gameTime,120) AS gameTime,id,hostTeam,guestTeam,stadium, referee FROM dbo.Games  WHERE gameTime>=GETDATE()`);
    const past_games= await DButils.execQuery(`SELECT id,CONVERT(VARCHAR,gameTime,120) AS gameTime,hostTeam,guestTeam,stadium,result,referee FROM dbo.Games  WHERE gameTime<GETDATE()`);
    return await getFutureAndPastGamesObject(past_games,future_games);
}
/**
 * This function checks if a game was played
 * @param {*} game_id ,id of the game to check
 * @returns true if wasn't played or false if was played
 */
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