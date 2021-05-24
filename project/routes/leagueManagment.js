const app=require("express");
const router=app.Router();
const assosiation_man_utils=require("./utils/assosiationManUtils");
const games_utils=require("./utils/gameUtils");

/**
 * middelware to check if user is assosiation man
 */
router.use(async(req,res,next)=>{
    try{
        if(req.session && req.session.user_name){// if logged in
            const asosiationMan= await assosiation_man_utils.getAssosiationMan();//get assosiation man user
            if(asosiationMan.username==req.session.user_name){// if logged in user is assosiation man
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

/**
 * router for adding a result to game
 */
router.use("/addResultToGame/:game_id", async(req,res,next)=>{
    try{
        checkIfGameWasPlayed(req,res,next);
    }
    catch(error){
        next(error);
    }
});

/**
 * router for adding an event schedule to past game
 */
router.use("/addEventSchedualeToGame/:game_id",async(req,res,next)=>{
    try{
        checkIfGameWasPlayed(req,res,next);
      }
    catch(error){
        next(error);
    }
});

/**
 * router for getting all games in database
 */
router.get("/getAllGames", async(req,res,next)=>{
    try{
        const games=await games_utils.getGamesOfCurrentStage();
        if(games.future_games_arr.length==0 && games.past_games_arr.length==0){//if there are no games in database
            res.sendStatus(204);
            return;
        }
        res.status(200).send(games);
    }
    catch(error){
        next(error);
    }
});

/**
 * router for getting all free referees for the game
 */
router.get("/getAllFreeRefereesToGame/:time_of_game", async(req,res,next)=>{
    try{
    const game_time= req.params.time_of_game;
    const free_referees=await assosiation_man_utils.getAllFreeRefereesToGame(game_time);
    if(free_referees.length==0){// if no avaliable referees for game
        res.status(204).send();
        return;
    }
    let free_referees_objects_arr=[];
    for(referee of free_referees){// create referee object for each avaliable referee
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

/**
 * router for adding game to the system
 */
router.post("/addGameToSystem", async(req,res,next)=>{
    try{
    const future_game=req.body;//get game details from request
    await assosiation_man_utils.addGameToSystem(future_game);//add game to system
    res.sendStatus(201);
    }
    catch(error){
        next(error);
    }
});

/**
 * router for adding result to game
 */
router.post("/addResultToGame/:game_id/:result", async(req,res,next)=>{
    try{
    const game_id=req.params.game_id;
    const result=req.params.result;
    await assosiation_man_utils.addResultToGame(game_id,result);
    res.sendStatus(201);
    }
    catch(error){
        next(error);
    }
});

/**
 * router for adding event schedule for a past game
 */
router.post("/addEventSchedualeToGame/:game_id", async(req,res,next)=>{
    try{
    const game_id=req.params.game_id;
    const eventsArr=req.body;//get event schedule from request body
    for(eventObj of eventsArr){//loop over each schedule and add it to the system
        await assosiation_man_utils.addEventToGame(game_id,eventObj);
    }
    res.status(201).send();
    }
    catch(error){
        next(error);
    }
});

/**
 * router for adding referee to the system
 */
router.post("/addRefereeToSystem",async(req,res,next)=>{
    try{
    const referee=req.body;//get referee details from request body
    await assosiation_man_utils.addRefereeToSystem(referee);//add referee to the system
    res.status(201).send();
    }
    catch(error){
        next(error);
    }
   });

   /**
    * This function checks if game was played and if yes, continue to add result or event schedule
    * @param {*} req , request
    * @param {*} res , respond
    * @param {*} next , next
    * @returns 
    */
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
