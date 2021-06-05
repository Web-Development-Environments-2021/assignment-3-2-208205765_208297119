const app=require("express");
const router=app.Router();
const players_utils=require("./utils/players_utils");
const coach_utils=require("./utils/coach_utils");
const team_utils=require("./utils/teams_utils");

/**
 * router for personal page of player
 */
router.get("/playerPage/:player_id", async (req,res,next) =>{
    try{
        const player_id = req.params.player_id;
    res.status(200).send(await players_utils.getPlayerById(player_id));
    }
    catch(error){
        next(error);
    }
});

/**
 * router for personal page of coach
 */
router.get("/coachPage/:coach_id", async (req,res,next)=>{
    try{
        const coach_id=req.params.coach_id;
    res.status(200).send(await coach_utils.getCoachPersonalPage(coach_id));
    }
    catch(error){
        next(error);
    }
});

/**
 * router for personal page of team
 */
router.get("/teamPage/:team_id",async (req,res,next)=>{
    try{
    const team_id=req.params.team_id;
    res.status(200).send(await team_utils.getTeamPageData(team_id));
    }
    catch(error){
        next(error);
    }
});

/**
 * router for team page by name
 */
router.get("/teamPageByName/:team_name", async(req,res,next)=>{
    try{
        const team_name=req.params.team_name;
        const team=await team_utils.teamPageDataByName(team_name);
        if(team==null){
            res.sendStatus(204);
        }
        else{
            res.status(200).send(team);
        }
    }
    catch(error){
        next(error);
    }
});

module.exports=router;