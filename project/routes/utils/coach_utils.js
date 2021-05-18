const axios=require("axios");
const team_utils=require("./teams_utils");

async function getCoachById(id){
    const coach=await axios.get(`${process.env.api_domain}/coaches/${id}`,{
        params:{
            api_token: process.env.api_token
        },
    });
    return coach;
}

async function getCoachPersonalPage(coach_id){
    const coach=await getCoachById(coach_id);
    const team=await team_utils.getTeamById(coach.data.data.team_id);
    const team_name=team.name;
    return {
    full_name:coach.data.data.fullname,
    team_name:team_name,
    pic:coach.data.data.image_path,
    common_name:coach.data.data.common_name,
    nationality:coach.data.data.nationality,
    birth_date:coach.data.data.birthdate,
    birth_country:coach.data.data.birthcountry,
    };
}

async function getCoachPreviewData(coach_id){
    const coach= await getCoachById(coach_id);
    const team=await team_utils.getTeamById(coach.data.data.team_id);
    const team_name=team.name;
    return {
    full_name:coach.data.data.fullname,
    team_name:team_name,
    pic:coach.data.data.image_path,
    };
}

exports.getCoachPersonalPage=getCoachPersonalPage;
exports.getCoachPreviewData=getCoachPreviewData;
