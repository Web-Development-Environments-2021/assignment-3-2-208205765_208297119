const app=require("express");
const router=app.Router();
const games_utils=require("./utils/gameUtils");

router.get("/", async(req,res,next)=>{
    try{
    const games= await games_utils.getGamesOfCurrentStage();
    res.status(200).send(games);
    }
    catch(error){
        next(error);
    }
});

module.exports=router;