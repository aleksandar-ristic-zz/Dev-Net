# DEV-net

Or developers network, is social media app for developers.
Users can register and login, make profiles, update them,
add experience and education sections.

They can see all profiles, togethers and individually, comunicate through posts,
like and unlike them, and start discussions below each post.

## It is fullstack app

that I made under Brad Traversy's Udemy course [MERN Full Stack front to back](https://bit.ly/3brgYCV)
He's an excellent programmer and even better teacher. I have only words of praise for that man.

### Backend API 
is made with NodeJs, Express and axios,

* JSON Webtoken for user auth,
* bcryptjs for hashing passwords,
* config keeps basic files in one place
* mongoose is used in order to easier interact with database

#### MongoDB Atlas 

is used for keeping database files,
mainly three groups: users, profiles and posts.

### Frontend Look

is made with ReactJS and Redux,
with bunch of middleware and routing libraries.

uuid is used for making id numbers

In development nodemon was used to restart API server
after saving and concurrently was used to start and hold
both NodeJs and React servers live.

This was amazing experience, I learned a lot of knew concepts
and technologies, mainly redux, which is a must for large-scale
applications. And most importantly I had a lot of fun making this
app, it's always great to combine interesting and useful.

## If you want to use this code

install package dependencies
```
npm i
```
then in console enter inside client folder
```
cd client
npm i
```
after that you have a script in package.json,
first exit client folder
```
cd ..
```
then run the script
```
npm run dev
```
if you use linux, you might have to use it like this
```
sudo npm run dev
```

and both frontend on localhost:3000
and backend on localhost:5000 will start

you might have to wait a bit, whole process can be quite lengthy

anyways, happy coding