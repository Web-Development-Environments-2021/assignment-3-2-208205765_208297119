const app=require("express");
const router=app.Router();
const games_utils=require("./utils/gameUtils");

/**
 * router for getting current stage games
 */
router.get("/", async(req,res,next)=>{
    try{
    const games= await games_utils.getGamesOfCurrentStage();
    if(games.future_games_arr.length==0 && games.past_games_arr.length==0){//if no games in database
        res.status(204).send("There are no games in database");
        return;
    }
    res.status(200).send(games);
    }
    catch(error){
        next(error);
    }
});

module.exports=router;