const app=require("express");
const router=app.Router();
const players_utils=require("./utils/players_utils");
const coach_utils=require("./utils/coach_utils");
const team_utils=require("./utils/teams_utils");

router.get("/playerPage/:player_id", async (req,res) =>{
    const player_id = req.params.player_id;
    res.status(200).send(await players_utils.getPlayerById(player_id));
});

router.get("/coachPage/:coach_id", async (req,res)=>{
    const coach_id=req.params.coach_id;
    res.status(200).send(await coach_utils.getCoachById(coach_id));
});

router.get("/teamPage/:team_id",async (req,res)=>{
    const team_id=req.params.team_id;
    
});

module.exports=router;