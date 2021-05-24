var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const games_utils=require("./utils/gameUtils");
const DButils=require("./utils/DButils");

/**
 * middlware for right column of the main page
 */
router.use("/rightColumn", async(req,res,next)=>{
  try{
    if (req.session && req.session.user_name) {//check if user is logged in
      DButils.execQuery("SELECT username FROM dbo.Users")
        .then((users) => {
          if (users.find((x) => x.username === req.session.user_name)) {
            req.user_name = req.session.user_name;
            next();
          }
        })
        .catch((err) => next(err));
    } else {
      res.sendStatus(401);
    }
  }
  catch(error){
    next(error);
  }
});

/**
 * router for left column of the main page
 */
router.get("/leftColumn", async (req, res, next) => {
  try {
    const league_details = await league_utils.getLeagueDetails();//get league details
    if(league_details.next_planned_game==null){// if there is no next game
      res.status(206).send(league_details);
    }
    else{
      res.status(200).send(league_details);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * router for right column of the main page
 */
router.get("/rightColumn", async(req,res,next)=>{
  try{
    const user_name=req.user_name;
  await games_utils.deletePlayedGames(user_name);//delete played games from favorites
  const games_arr= await games_utils.getThreeNextGames(user_name);
  if(games_arr.length==0){//if there are no favorite games
    res.status(204).send("you don't have favorite games");
  }
  else{
    res.status(200).send(games_arr);
  }
  }
  catch(error){
    next(error);
  }
})

module.exports = router;
