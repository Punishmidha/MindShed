
/*
npm i express mongoose bcrypt jsonwebtoken cookie-parser ejs

TASK -> user post likh payege
    1> user create krne hai (ejs me form vgera bnayege)
    2> login and register 
    3> logout krna h
    4> post creation
    5> post like
    6> post delete (owner of that post can only do this)




// post register :
    iska khud ka koi page ni bs data store krne k liye bnaya
    1> if email already exist in database then return already registered
    2> generate random salt then hash that salt with our password and that hash will me stored in the database


// post login
    3> match old password with new password through bcrypt


// middleware for protected routes
    -> agar ham logged in hoge to hme ye middleware milega to check krna hai ki uske pass ye token hai ya ni hai
    -> middle ware k sath req me data bhej dia taaki bad me bhi usko use hoga
    -> middle ware k vjeh se he sab routes me ham apna username bhej sakte hai
    -> protected route -> jisme middle ware use hota hai
    















*/