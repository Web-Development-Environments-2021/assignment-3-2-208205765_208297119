const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

async function getPlayerIdsByTeam(team_id) {
  let player_ids_list = [];
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  });
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}

async function getPlayersByName(name){
  const players= await axios.get(`${process.env.api_domain}/players/search/:PLAYER_NAME`,{
    params:{
        api_token:process.env.api_token,
        PLAYER_NAME: name,
        include: "team"
    },
});
  if(players.data.Length==0){ // if no players were found
    return [];
  }
  return extractRelevantPlayerData(players);
}

async function getPlayerById(id){
  const player= await axios.get(`${process.env.api_domain}/players/${id}`,{
    params:{
      api_token: process.env.api_token,
      include: "team"
    },
  });
  return {
    full_name:player.data.data.fullname,
    team_name:player.data.data.team.data.name,
    pic:player.data.data.image_path,
    position_number: player.data.data.position_id,
    common_name:player.data.data.commonname,
    nationality:player.data.data.nationality,
    birth_date:player.data.data.birthdate,
    birth_country:player.data.data.birthcountry,
    height:player.data.data.height,
    weight:player.data.data.weight
  }; 
}

async function getPlayersInfo(players_ids_list) {
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      axios.get(`${api_domain}/players/${id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  return extractRelevantPlayerData(players_info);
}

function extractRelevantPlayerData(players_info) {
  return players_info.map((player_info) => {
    const { fullname, image_path, position_id } = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}

async function getPlayersByTeam(team_id) {
  let player_ids_list = await getPlayerIdsByTeam(team_id);
  let players_info = await getPlayersInfo(player_ids_list);
  return players_info;
}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getPlayersByName= getPlayersByName;
exports.getPlayerById=getPlayerById;
