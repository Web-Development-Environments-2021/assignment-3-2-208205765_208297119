const app=require("express");
const router=app.Router();
const assosiation_man_utils=require("./utils/assosiationManUtils");
const games_utils=require("./utils/gameUtils");

router.use(async(req,res,next)=>{
    if(req.session && req.session.user_name){
        const asosiationMan= await assosiation_man_utils.getAssosiationMan();
        if(asosiationMan==req.session.user_name){
            next();
        }
        else{
            res.status(403).send("you don't have access");
        }
    }
    else{
        res.status(403).send("you don't have access");
    }
});

router.use("/addResultToGame/:game_id", async(req,res,next)=>{
    checkIfGameWasPlayed(req,res,next);
});

router.use("/addEventSchedualeToGame/:game_id",async(req,res,next)=>{
    checkIfGameWasPlayed(req,res,next);
});

router.get("/getAllGames", async(req,res)=>{
    res.status(200).send(await games_utils.getGamesOfCurrentStage());
});

router.post("/addGameToSystem", async(req,res)=>{
    const future_game=req.body.future_game;
    await assosiation_man_utils.addGameToSystem(future_game);
    res.status(201);
});

router.post("addResultToGame/:game_id/:result", async(req,res)=>{
    const game_id=req.params.game_id;
    const result=req.params.result;
    await assosiation_man_utils.addResultToGame(game_id,result);
    res.status(201);
});

router.post("addEventSchedualeToGame/:game_id", async(req,res)=>{
    const game_id=req.params.game_id;
    const event=req.body.eventsArr;
    for(event of eventsArr){
        await assosiation_man_utils.addEventToGame(game_id,event);
    }
    res.status(201);
});

router.post("/addRefereeToSystem",async(req,res)=>{
    const referee=req.body.refereeObject;
    await assosiation_man_utils.addRefereeToSystem(referee);
    res.status(201);
});

router.get("getAllFreeRefereesToGame/:time_of_game", async(req,res)=>{
    const game_time= req.params.time_of_game;
    const free_referees=await assosiation_man_utils.getAllFreeRefereesToGame(game_time);
    if(free_referees.length==0){
        res.status(204);
        return;
    }
    let free_referees_objects_arr=[];
    for(referee of free_referees){
        free_referees_objects_arr.push({
            referee_id: referee[0],
            referee_name: referee[1]
        });
    }
    res.status(200).send(free_referees_objects_arr);
});

async function checkIfGameWasPlayed(req,res,next){
    const game_id =req.params.game_id;
    const was_played= await games_utils.checkIfGameWasPlayed(game_id);
    if(!was_played){
        res.status(404).send("you cannot add result to unplayed game");
        return;
    }
    next();
}


module.exports=router;
