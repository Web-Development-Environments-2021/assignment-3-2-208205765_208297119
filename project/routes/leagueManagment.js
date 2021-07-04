const app=require("express");
const router=app.Router();
const assosiation_man_utils=require("./utils/assosiationManUtils");
const games_utils=require("./utils/gameUtils");
const teamUtils=require("./utils/teams_utils")

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

router.use("/addGameToSystem",async(req,res,next)=>{
    try{
        const game=req.body;
        const gameWasAdded=await assosiation_man_utils.checkIfGameWasAdded(game);
        if(gameWasAdded){
            res.status(409).send("Game was already added");
            return;
        }
        const valid_home_team=await assosiation_man_utils.checkIfTeamExist(game.home_team);//check if valid home team name
        if(!valid_home_team){
            res.status(400).send("Wrong home team name");
            return;
        }
        const valid_away_team=await assosiation_man_utils.checkIfTeamExist(game.away_team);//check if valid away team name
        if(!valid_away_team){
            res.status(400).send("wrong away team name");
        }
        else{
            next();
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
        const game_id=req.params.game_id;
        if(!await checkIfGameWasPlayed(game_id)){
            const resultWasAdded=await assosiation_man_utils.checkIfResultWasAdded(game_id);
            if(resultWasAdded){
                res.sendStatus(409);
            }
            else{
                next();
            }
        }
       
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
        const game_id=req.params.game_id;
        if(!await checkIfGameWasPlayed(game_id)){//check if game was played
            const eventsArr=req.body;
            for(eventObj of eventsArr){//check every event if he was already added
                const eventWasAdded= await assosiation_man_utils.checkIfEventWasAdded(eventObj,game_id);
            if(eventWasAdded){
                res.status(409).send("One or more of the events you are trying to add was already added");
                return;
            }
            }
            next();
            
        }
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
 * This router returns all teams names that play in current season
 */
router.get("/getAllTeamsInLeague",async(req,res,next)=>{
   try{
       const teams= await teamUtils.getAllTeamsBySeasonID()
        let teams_names=[]
        for(team of teams.data.data){
            teams_names.push({
                name:team.name,
                id:team.id
            })
        }
        res.status(200).send(teams_names)
    }
    catch(error){
        next(error)
    }

})


   /**
    * This function checks if game was played and if yes, continue to add result or event schedule
    * @param {*} req , request
    * @param {*} res , respond
    * @param {*} next , next
    * @returns 
    */
async function checkIfGameWasPlayed(game_id){
    const was_played= await games_utils.checkIfGameWasPlayed(game_id);
    if(!was_played){
        res.status(404).send("you cannot add result or event schedule to unplayed game");
        return true;
    }
    return false;
    
}


module.exports=router;
