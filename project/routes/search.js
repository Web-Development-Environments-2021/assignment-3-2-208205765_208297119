let app=require("express");
let router=app.Router();
const players_utils=require("./utils/players_utils");
const teams_utils=require("./utils/teams_utils");

router.use("/lastResults", async(req,res,next)=>{
    if(req.session && req.session.user_name){
        next();
    }
    else{
        res.status(401).send("user is not logged in to get last search results");
    }
});

router.get("/lastResults",async(req,res)=>{
    if(!req.session.last_search_results){
        res.sendStatus(204);
    }
    else{
        res.status(200).send(req.session.last_search_results);
    }
    
});

router.get("/:name",async (req,res,next) =>{
    try{
    const name=req.params.name;
    const players= await getAllPlayersByName(name);
    const teams= await teams_utils.getTeamsByName(name); // find all teams with the query name
    const coaches= await getAllCoachesByName(name);
    const searchObj={
        playersArray: players,
        coachesArray: coaches,
        teamsArray: teams
    };
    if(players.length==0 && coaches.length==0 && teams.length==0){
        if(req.session.user_name){
            req.session.last_search_results=null;
        }
        res.status(204).send("No players,teams,coaches were found");
        return;
    }
    if(req.session.user_name){
        req.session.last_search_results=searchObj;
    }
    if(players.length==0 || coaches.length==0 || teams.length==0){
        res.status(206).send(searchObj);
        return;
    }
    res.status(200).send(searchObj);
    }
    catch(error){
        next(error);
    }
});



async function getAllPlayersByName(name){
    const players= await players_utils.getPlayersByName(name); // find all players with that name
    const season_id_teams= await teams_utils.getAllTeamsBySeasonID();
    if(players.data.data.length==0 || season_id_teams.data.data.length==0){
        return [];
    }

    let relevant_players=[];
    for(let i=0;i<players.data.data.length;i++){
        const team_id=players.data.data[i].team_id;
        if(team_id!=null && season_id_teams.data.data.find(x=> x.id===team_id)){
            relevant_players.push(players_utils.getPlayerPreviewData(players.data.data[i]));
        }
      }
    return relevant_players;
}

async function getAllCoachesByName(name){
    const season_teams= await teams_utils.getAllTeamsBySeasonID();
    let coaches=[];
    for(let i=0;i<season_teams.data.data.length;i++){
        const coach_full_name=season_teams.data.data[i].coach.data.fullname;
        const firstName=season_teams.data.data[i].coach.data.firstname;
        const lastName=season_teams.data.data[i].coach.data.lastname;
        if(name==firstName || name==lastName || name==coach_full_name){
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