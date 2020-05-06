// jshint esversion:8

// At first we acquire some packages to use to use in this file. so first acquire EXPRESS BODY-PARSER in our code
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/davm.js");
// use express in our code. so initialize app to acquire express.
const app = express();

// made an item list array for main list menu and work array for work list menu
// we force you to read docs of const array.
// declaring an array to const means that you can not assign another array (whole) to this but you can do some manipulation (insertion..etc)
const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItem = [];

// set function is used to include ejs template files in our javascript code.
app.set('view engine', 'ejs');

// this use function is used to acquire feature for parsing the body of html file( Extracting data from Html file)
app.use(bodyParser.urlencoded({
  extended: true
}));

// this use function is used because when we deploy our application to server then it can access the file.
// because when we run this on local server then it can fetch the file from local folder but when it is on
// Globe or on actual server it need to fetch the file and if we did not place this files in Public folder
// then the server is unable to access these files.
app.use(express.static("public"));

// get function is used to send GET request to server. so that it render some file (HTML or EJS) to our Path or Route that is "/" in this condition.
app.get("/", function(req, res) {
// render function render date to appropriate ejs file(in this case LISTS), and pass data along with define variables.
  const day = date.getDay();
  res.render('lists', {
    listTitle: day,
    todo_Data: items
  });
});

// post method is used to send the data back when the post route is triggered by appropriate HTML
app.post("/", function(req, res) {
  // item variable contain some data that is parsed by bodyParser of some HTML element
  const item = req.body.Todo_Item;
  const checkData = date.checkValue(item);
  if (req.body.button === "Work") {
    if(!checkData){
      workItem.push(item);
    }
    res.redirect("/work");
  }
  else {
    if(!checkData){
      items.push(item);
    }
    res.redirect("/");
  }
});


app.post("/del",(req, res) =>{

});

// this is another Get route to render some html or ejs template to some http address
app.get("/work", (req, res) => {
  res.render("lists", {
    listTitle: "Work",
    todo_Data: workItem
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

// listen funtion is used to set the path(in this the address of local port, in this case 3000)
app.listen("3000", () => {
  console.log("server is running at port 3000");
});
