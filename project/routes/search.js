let app=require("express");
const axios=require("axios");
let router=app.Router();
const players_utils=require("./utils/players_utils");
const teams_utils=require("./utils/teams_utils");
const season_id_teams= await teams_utils.getAllTeamsBySeasonID();

router.get("/:name",async (req,res) =>{
    const name=req.query.name;
    const players=getAllPlayersByName(name);
    const teams= teams_utils.getTeamsByName(name); // find all teams with the query name 
});

function getAllPlayersByName(name){
    const players= await players_utils.getPlayersByName(name); // find all players with that name
    if(players.data.length==0 || season_id_teams.data.length==0){
        return [];
    }

    let relevant_players=[];
    for(let i=0;i<players.data.length;i++){
        const team_id=players.data[i].data.data.team.data.team_id;
        if(season_id_teams.data.find(x=> x.data.team_id===team_id)){
            relevant_players.push(players_utils.getPlayerPreviewData(players.data[i]));
        }
    }
    return relevant_players;
}

function getAllTeamsByName(name){
    
}

module.exports=router;