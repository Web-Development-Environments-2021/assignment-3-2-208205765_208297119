const axios=require("axios");
const players_utils=require("./players_utils");
const coach_utils=require("./coach_utils");
const DButils=require("./DButils");
const games_utils=require("./gameUtils");

/**
 * This function returns a team object after a search by id of the team
 * @param {*} team_id , id of the team to search
 * @returns team object
 */
async function getTeamById(team_id){
    const team= await axios.get(`${process.env.api_domain}/teams/${team_id}`,{
        params:{
            api_token: process.env.api_token
        },
    });
    return team.data.data;
}

/**
 * This function return a team object with team page data
 * @param {*} team_id id of the team to search
 * @returns team object with relevant data
 */
async function getTeamPageData(team_id){
    //get team from external api
    const team = await axios.get(`${process.env.api_domain}/teams/${team_id}`,{
        params:{
            api_token: process.env.api_token,
            include: "coach,squad.player"
        },
    });
    //let players_info=await players_utils.getPlayersByTeam(team_id);//get team's players info
    const playersArr=team.data.data.squad.data;
    const team_name=team.data.data.name;
    let players_info=[];
    for(let player of playersArr){
        players_info.push(players_utils.getPlayerPreviewDataForTeamPage(player.player.data,team_name));
    }
    //get data of team's coach
    let coach_data={
        coach_id: team.data.data.coach.data.coach_id,
        full_name:team.data.data.coach.data.fullname,
        team_name: team.data.data.name,
        pic: team.data.data.coach.data.image_path
    };
    
    let team_games= await games_utils.getGamesOfTeam(team_name);//get team's games
    return {
        team_id: team_id,
        team_name: team_name,
        team_logo: team.data.data.logo_path,
        players: players_info,
        coach: coach_data,
        games: team_games
    };
}

/**
 * This function returns all the teams of the current season of Danish SuperLeague
 * @returns an array of the teams of current season
 */
async function getAllTeamsBySeasonID(){
    return await axios.get(`${process.env.api_domain}/teams/season/${process.env.season_id}`,{
        params:{
            api_token: process.env.api_token,
            include: "coach"
        },
    });
}

/**
 * This function returns team object after searching by name
 * @param {*} name, name of the team to search
 * @returns an array of teams with the given name
 */
async function getTeamsByName(name){
    const teams_in_season= await getAllTeamsBySeasonID();//get all the teams of the season
    if(teams_in_season.data.data.length==0){
        return [];
    }
    //get all the teams by the given name
    const teams_by_name= await axios.get(`${process.env.api_domain}/teams/search/${name}`,{
        params:{
            api_token: process.env.api_token
        },
    });
    if(teams_by_name.data.data.length==0){//if no teams were found
        return [];
    }
    let relevant_teams=[];
    //filter the teams that only teams from current season and with given name will return
    for(let i=0;i<teams_by_name.data.data.length;i++){
        const team_id=teams_by_name.data.data[i].id;
        if(teams_in_season.data.data.find(x=> x.id===team_id)){// if the team in current season teams
            relevant_teams.push({
                team_id: teams_by_name.data.data[i].id,
                team_name: teams_by_name.data.data[i].name,
                team_logo: teams_by_name.data.data[i].logo_path
            });
        }
    }
    return relevant_teams;
}

/**
 * This function gets team's page by team name
 * @param {*} team_name , name of the team to return it's page
 * @returns team's object containing all relevant data
 */
async function teamPageDataByName(team_name){
    const team=await axios.get(`${process.env.api_domain}/teams/search/${team_name}`,{
        params:{
            api_token: process.env.api_token
        },
    });
    if(team.data.data.length==0){
        return null;
    }
    return await getTeamPageData(team.data.data[0].id);
}

exports.getTeamsByName= getTeamsByName;
exports.getTeamById=getTeamById;
exports.getTeamPageData=getTeamPageData;
exports.getAllTeamsBySeasonID=getAllTeamsBySeasonID;
exports.teamPageDataByName=teamPageDataByName;
