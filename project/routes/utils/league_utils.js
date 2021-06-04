const axios = require("axios");
const game_utils=require("./gameUtils");

/**
 * This function ruturns the details of the main page about the league
 * @returns 
 */
async function getLeagueDetails() {
  const league = await axios.get(
    `${process.env.api_domain}/leagues/${process.env.league_id}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  const stage = await axios.get(
    `${process.env.api_domain}/stages/77453568`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
    let nearestGame=await game_utils.getNearestGame();//get nearest game that need to be played
  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    current_stage_name: stage.data.data.name,
    next_planned_game: nearestGame
  };
}
exports.getLeagueDetails = getLeagueDetails;
