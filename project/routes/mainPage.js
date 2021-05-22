var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const games_utils=require("./utils/gameUtils");

router.use("/rightColumn", async(req,res,next)=>{
  try{
    if (req.session && req.session.user_name) {
      DButils.execQuery("SELECT user_id FROM dbo.Users")
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
  }
  catch(error){
    next(error);
  }
});

router.get("/leftColumn", async (req, res, next) => {
  try {
    const league_details = await league_utils.getLeagueDetails();
    res.status(200).send(league_details);
  } catch (error) {
    next(error);
  }
});

router.get("/rightColumn", async(req,res,next)=>{
  try{
    const user_name=req.user_name;
  await games_utils.deletePlayedGames(user_name);//delete played games from favorites
  const games_arr= await games_utils.getThreeNextGames(user_name);
  if(games_arr.length==0){
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
