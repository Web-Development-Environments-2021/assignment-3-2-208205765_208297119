var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const team_utils=require("./utils/teams_utils");
const games_utils=require("./utils/gameUtils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_name) {
    DButils.execQuery("SELECT user_id FROM users_tirgul")
      .then((users) => {
        if (users.find((x) => x.user_name === req.session.user_name)) {
          req.user_name = req.session.user_name;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/addTeam/:user_name", async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const team_id = req.body.team_id;
    await users_utils.addTeamToFavorites(user_name, team_id);
    res.status(201).send("The team was added successfully to favorites");
  } catch (error) {
    next(error);
  }
});


router.post("/addPlayer/:user_name", async(req,res,next)=>{
  const user_name = req.session.user_name;
  const player_id = req.body.player_id;
  await users_utils.addPlayerToFavorites(user_name,player_id);
  res.status(201).send("player was added to favorites list");
});

router.post("/addGameToFavorites/:user_name", async (req,res)=>{
  const user_name = req.session.user_name;
  const game_id = req.body.game_id;
  await users_utils.addGameToFavorites(user_name,game_id);
  res.status(201).send("game was added successfully");
});

router.get("/getFavoriteTeams/:user_name", async(req,res)=>{
    const user_name=req.params.user_name;
    const teams_id= await users_utils.getFavoriteTeamsID(user_name);
    if(teams_id.length==0){
      res.status(204).send("no favorite games found");
      return;
    }
    let favoriteTeams=[];
    for(let i=0;i<teams_id.length;i++){
      favoriteTeams.push(team_utils.getTeamPageData(teams_id[i]));
    }
    res.status(200).send(favoriteTeams);
});

router.get("/getFavoriteGames", async(req,res)=>{
  const user_name=req.params.user_name;
  await games_utils.deletePlayedGames(user_name);
  const games_id=await users_utils.getFavoriteGamesID(user_name);
  if(games_id.length==0){
    res.status(204).send("no games were found");
    return;
  }
  let favorite_games=[];
  for(let i=0;i<games_id.length;i++){
    favorite_games.push(games_utils.getGameDetailsByID(games_id[i]));
  }
  res.status(200).send(favorite_games);
});

/**
 * This path returns the favorites players that were saved by the logged-in user
 */
router.get("/getFavoritePlayers/:user_name", async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const player_ids = await users_utils.getFavoritePlayers(user_name);
    let player_ids_array = [];
    player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
    const results = await players_utils.getPlayersInfo(player_ids_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
