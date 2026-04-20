app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

class RateLimiter {
    limit;
    windowMs;

    constructor(windowMs,limit,userID){
        this.windowMs=windowMs;
        this.limit=limit;
        this.userID=userID;
        this.map=new Map();
    }

    isAllowed(){
        if(!this.map.has(this.userID)){
            this.map.set(this.userID,[]);
        }
        const user=this.map.get(this.userID);
        const now=Date.now();
        user.push(now);
        this.map.set(this.userID,user);
        return true;
    }
}

const rateLimiter = new RateLimiter();

app.get('/api/posts', (req, res) => {
    if (!rateLimiter.isAllowed()) {
        return res.status(429).send('Too many requests');
    }
    res.json({ message: 'Success' });
});