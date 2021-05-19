const axios=require("axios");
const players_utils=require("./players_utils");
const coach_utils=require("./coach_utils");
const DButils=require("./DButils");
const games_utils=require("./gameUtils");

async function getTeamsByName(name){
    const teams= await axios.get(`${process.env.api_domain}/teams/search/:TEAM_NAME`,{
        params:{
            api_token: process.env.api_token,
            TEAM_NAME: name
        }
    });
    let teams_data=[];
    if(teams.data.length!=0){
        for(let i=0;i<teams.data.Length;i++){
                data=[teams.data[i].name,teams.data[i].logo];
                teams_data.push(data);
        }
    }
    return teams_data;
}

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
    let coach_data=await coach_utils.getCoachPreviewData(team.data.data.coach_id);
    let team_games= await games_utils.getGamesOfTeam(team_id);
    return {
        team_name: team.data.data.name,
        team_logo: team.data.data.logo_path,
        players: players_info,
        coach: coach_data,
        games: team_games
    };
}

async function getAllTeamsBySeasonID(){
    return await axios.get(`${process.env.api_domain}/teams/season/${process.env.season_id}`);
}

exports.getTeamsByName= getTeamsByName;
exports.getTeamById=getTeamById;
exports.getTeamPageData=getTeamPageData;
exports.getAllTeamsBySeasonID=getAllTeamsBySeasonID;