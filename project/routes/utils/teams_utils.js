const axios=require("axios");

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

async function createTeamPage(team_id){
    
}

exports.getTeamsByName= getTeamsByName;
exports.getTeamById=getTeamById;