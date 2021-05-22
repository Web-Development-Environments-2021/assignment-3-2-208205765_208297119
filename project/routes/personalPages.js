const app=require("express");
const router=app.Router();
const players_utils=require("./utils/players_utils");
const coach_utils=require("./utils/coach_utils");
const team_utils=require("./utils/teams_utils");

router.get("/playerPage/:player_id", async (req,res,next) =>{
    try{
        const player_id = req.params.player_id;
    res.status(200).send(await players_utils.getPlayerById(player_id));
    }
    catch(error){
        next(error);
    }
});

router.get("/coachPage/:coach_id", async (req,res,next)=>{
    try{
        const coach_id=req.params.coach_id;
    res.status(200).send(await coach_utils.getCoachPersonalPage(coach_id));
    }
    catch(error){
        next(error);
    }
});

router.get("/teamPage/:team_id",async (req,res,next)=>{
    try{
    const team_id=req.params.team_id;
    res.status(200).send(await team_utils.getTeamPageData(team_id));
    }
    catch(error){
        next(error);
    }
});

module.exports=router;