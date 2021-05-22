const app=require("express");
const router=app.Router();
const assosiation_man_utils=require("./utils/assosiationManUtils");
const games_utils=require("./utils/gameUtils");

router.use(async(req,res,next)=>{
    try{
        if(req.session && req.session.user_name){
            const asosiationMan= await assosiation_man_utils.getAssosiationMan();
            if(asosiationMan.username==req.session.user_name){
                next();
            }
            else{
                res.status(403).send("you don't have access");
            }
        }
        else{
            res.status(403).send("you don't have access");
        }
    }
    catch(error){
        next(error);
    }
});

router.use("/addResultToGame/:game_id", async(req,res,next)=>{
    try{
        checkIfGameWasPlayed(req,res,next);
    }
    catch(error){
        next(error);
    }
});

router.use("/addEventSchedualeToGame/:game_id",async(req,res,next)=>{
    try{
        checkIfGameWasPlayed(req,res,next);
    }
    catch(error){
        next(error);
    }
});

router.get("/getAllGames", async(req,res,next)=>{
    try{
        res.status(200).send(await games_utils.getGamesOfCurrentStage());
    }
    catch(error){
        next(error);
    }
});

router.get("/getAllFreeRefereesToGame/:time_of_game", async(req,res,next)=>{
    try{
        const game_time= req.params.time_of_game;
    const free_referees=await assosiation_man_utils.getAllFreeRefereesToGame(game_time);
    if(free_referees.length==0){
        res.status(204).send();
        return;
    }
    let free_referees_objects_arr=[];
    for(referee of free_referees){
        free_referees_objects_arr.push({
            referee_id: referee.referee_id,
            referee_name: referee.fullName
        });
    }
    res.status(200).send(free_referees_objects_arr);
    }
    catch(error){
        next(error);
    }
});

router.post("/addGameToSystem", async(req,res,next)=>{
    try{
    const future_game=req.body;
    await assosiation_man_utils.addGameToSystem(future_game);
    res.status(201).send();
    }
    catch(error){
        next(error);
    }
});

router.post("/addResultToGame/:game_id/:result", async(req,res,next)=>{
    try{
    const game_id=req.params.game_id;
    const result=req.params.result;
    await assosiation_man_utils.addResultToGame(game_id,result);
    res.status(201).send();
    }
    catch(error){
        next(error);
    }
});

router.post("/addEventSchedualeToGame/:game_id", async(req,res,next)=>{
    try{
        const game_id=req.params.game_id;
    const event=req.body.eventsArr;
    for(event of eventsArr){
        await assosiation_man_utils.addEventToGame(game_id,event);
    }
    res.status(201).send();
    }
    catch(error){
        next(error);
    }
});

router.post("/addRefereeToSystem",async(req,res,next)=>{
    try{
    const referee=req.body;
    await assosiation_man_utils.addRefereeToSystem(referee);
    res.status(201).send();
    }
    catch(error){
        next(error);
    }
   });

async function checkIfGameWasPlayed(req,res,next){
    const game_id =req.params.game_id;
    const was_played= await games_utils.checkIfGameWasPlayed(game_id);
    if(!was_played){
        res.status(404).send("you cannot add result or event schedule to unplayed game");
        return;
    }
    next();
}


module.exports=router;
