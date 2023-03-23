let cronInterval=null;

exports.start= async(cb,delayInterval)=>{
        if(!cronInterval)
        cronInterval = await setInterval(cb,delayInterval);
}

exports.stop=async ()=>{
    if(cronInterval)
    await clearInterval(cronInterval);
    cronInterval=null;
}

exports.isCronRunning=()=>cronInterval!==null;



