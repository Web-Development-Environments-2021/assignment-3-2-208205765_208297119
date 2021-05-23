const axios=require("axios");
const players_utils=require("./players_utils");
const coach_utils=require("./coach_utils");
const DButils=require("./DButils");
const games_utils=require("./gameUtils");

async function getTeamById(team_id){
    const team= await axios.get(`${process.env.api_domain}/teams/${team_id}`,{
        params:{
            api_token: process.env.api_token
        },
    });
    return team.data.data;
}

async function getTeamPageData(team_id){
    const team = await axios.get(`${process.env.api_domain}/teams/${team_id}`,{
        params:{
            api_token: process.env.api_token,
            include: "coach"
        },
    });
    let players_info=await players_utils.getPlayersByTeam(team_id);
    let coach_data={
        full_name:team.data.data.coach.data.fullname,
        team_name: team.data.data.name,
        pic: team.data.data.coach.data.image_path
    };
    const team_name=team.data.data.name;
    let team_games= await games_utils.getGamesOfTeam(team_name);
    return {
        team_id: team_id,
        team_name: team_name,
        team_logo: team.data.data.logo_path,
        players: players_info,
        coach: coach_data,
        games: team_games
    };
}

async function getAllTeamsBySeasonID(){
    return await axios.get(`${process.env.api_domain}/teams/season/${process.env.season_id}`,{
        params:{
            api_token: process.env.api_token,
            include: "coach"
        },
    });
}

async function getTeamsByName(name){
    const teams_in_season= await getAllTeamsBySeasonID();
    if(teams_in_season.data.data.length==0){
        return [];
    }
    const teams_by_name= await axios.get(`${process.env.api_domain}/teams/search/${name}`,{
        params:{
            api_token: process.env.api_token
        },
    });
    if(teams_by_name.data.data.length==0){
        return [];
    }
    let relevant_teams=[];
    for(let i=0;i<teams_by_name.data.data.length;i++){
        const team_id=teams_by_name.data.data[i].id;
        if(teams_in_season.data.data.find(x=> x.id===team_id)){
            relevant_teams.push({
                team_id: teams_by_name.data.data[i].id,
                team_name: teams_by_name.data.data[i].name,
                team_logo: teams_by_name.data.data[i].logo_path
            });
        }
    }
    return relevant_teams;
}

exports.getTeamsByName= getTeamsByName;
exports.getTeamById=getTeamById;
exports.getTeamPageData=getTeamPageData;
exports.getAllTeamsBySeasonID=getAllTeamsBySeasonID;
