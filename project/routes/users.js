var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");

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
    await users_utils.markPlayerAsFavorite(user_name, team_id);
    res.status(201).send("The team was added successfully to favorites");
  } catch (error) {
    next(error);
  }
});


router.post("/addPlayer/:user_name", async(req,res,next)=>{
  const user_name = req.session.user_name;
  const player_id = req.body.player_id;
  
});

/**
 * This path returns the favorites players that were saved by the logged-in user
 */
router.get("/favoritePlayers", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    let favorite_players = {};
    const player_ids = await users_utils.getFavoritePlayers(user_id);
    let player_ids_array = [];
    player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
    const results = await players_utils.getPlayersInfo(player_ids_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
