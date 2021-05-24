let app=require("express");
let router=app.Router();
const players_utils=require("./utils/players_utils");
const teams_utils=require("./utils/teams_utils");

/**
 * middelware for last search results of the user 
 */
router.use("/lastResults", async(req,res,next)=>{
    if(req.session && req.session.user_name){//check if user is logged in
        next();
    }
    else{
        res.status(401).send("user is not logged in to get last search results");
    }
});

/**
 * router for getting last user search results
 */
router.get("/lastResults",async(req,res)=>{
    if(!req.session.last_search_results){// if user is logged in and no last search results
        res.sendStatus(204);
    }
    else{
        res.status(200).send(req.session.last_search_results);
    }
    
});

/**
 * router for search teams,players,coaches by name
 */
router.get("/:name",async (req,res,next) =>{
    try{
    const name=req.params.name;
    const players= await getAllPlayersByName(name);//find all players with given name
    const teams= await teams_utils.getTeamsByName(name); // find all teams with given name
    const coaches= await getAllCoachesByName(name);//fund all coaches with given name
    const searchObj={
        playersArray: players,
        coachesArray: coaches,
        teamsArray: teams
    };
    if(players.length==0 && coaches.length==0 && teams.length==0){//if no search results
        if(req.session.user_name){//if user is logged in, delete last search result property
            delete req.session.last_search_results;
        }
        res.status(204).send("No players,teams,coaches were found");
        return;
    }
    if(req.session.user_name){// if user is logged in, save his last search results
        req.session.last_search_results=searchObj;
    }
    if(players.length==0 || coaches.length==0 || teams.length==0){// if partial search results
        res.status(206).send(searchObj);
        return;
    }
    res.status(200).send(searchObj);
    }
    catch(error){
        next(error);
    }
});

/**
 * This function finds all the players with given name
 * @param {*} name , name of the player to search
 * @returns array of players with given name
 */
async function getAllPlayersByName(name){
    const players= await players_utils.getPlayersByName(name); // find all players with that name
    const season_id_teams= await teams_utils.getAllTeamsBySeasonID();// get all teams that play in current season of Danish league
    if(players.data.data.length==0 || season_id_teams.data.data.length==0){// if no players or no teams
        return [];
    }

    let relevant_players=[];
    for(let i=0;i<players.data.data.length;i++){
        const team_id=players.data.data[i].team_id;
        if(team_id!=null && season_id_teams.data.data.find(x=> x.id===team_id)){// filter all players that don't play in current season
            relevant_players.push(players_utils.getPlayerPreviewData(players.data.data[i]));
        }
      }
    return relevant_players;
}

/**
 * This function gets all the coaches that fit the given name and train a team in current season
 * @param {*} name , name of the coach to search
 * @returns array of coaches
 */
async function getAllCoachesByName(name){
    const season_teams= await teams_utils.getAllTeamsBySeasonID();// gett all teams in current season
    let coaches=[];
    for(let i=0;i<season_teams.data.data.length;i++){//filter all coaches that don't train a team in current season
        const coach_full_name=season_teams.data.data[i].coach.data.fullname;
        if(coach_full_name.toLowerCase().includes(name.toLowerCase())){
            coaches.push({
                coach_id:  season_teams.data.data[i].coach.data.coach_id,
                full_name: coach_full_name,
                team_name: season_teams.data.data[i].name,
                pic: season_teams.data.data[i].logo_path
            });
        }
    }
    return coaches;
}

module.exports=router;