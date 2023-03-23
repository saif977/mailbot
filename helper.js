const fs=require("fs");


exports.getDataFromFile=(filePath)=>{
    try{
        const fileData=fs.readFileSync(filePath,{encoding:"utf-8"});
        return (JSON.parse(fileData))?.web;
    }
    catch(err){console.log(err)};
}

