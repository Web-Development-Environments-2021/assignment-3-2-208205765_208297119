let app=require("express");
const axios=require("axios");
let router=app.Router();
const players_utils=require("./utils/players_utils");
const teams_utils=require("./utils/teams_utils");

router.get("/",async (req,res,next) =>{
    const name=req.query.id;
    let data=[];
    const players=players_utils.getPlayersByName(name); // find all players with that name
    const teams= teams_utils.getTeamsByName(name); // find all teams with the query name 
});

module.exports=router;