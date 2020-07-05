// jshint esversion:8

// At first we acquire some packages to use to use in this file. so first acquire EXPRESS BODY-PARSER in our code
const express = require("express");
const bodyParser = require("body-parser");
//custom module we created inside the code
const date = require(__dirname + "/davm.js");
// lodash for charcter conversion
const _ = require("lodash");
// use express in our code. so initialize app to acquire express.
const app = express();
// requiring mongoose in our project
const mongoose = require('mongoose');

// creating our database as todoDB(if not existed in the database) with some use tags for pass warnings
mongoose.connect("mongodb://localhost:27017/todoDB", {useNewUrlParser: true,  useUnifiedTopology: true});

// below line works as a checker who shows an error if database is not connected(created) and a welcome log when it connects to the server.
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});


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

// some default variables to use them in our code.
let defaultName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let checker = 1;

// below fruitschema const works as a class like it provide structure for the data so this is mainly called as COLLECTION of database(TABLE(model of table) in sql).
/* this is the main schema of our main todo list  */
const itemsSchema = {
  name: String
};
// this is the custom schema that we crated for custom list( one for all pages)
const clistItemSchema = {
  name: String,
  items: [itemsSchema]
}

// here we're creating model of those schemas that we created early first for default todolist second for custom list
const Item = mongoose.model("item", itemsSchema);
const List = mongoose.model("List", clistItemSchema);

// below are the documents that we created using the schema, so that we can use them in our code as default list items(in-case if no todo's are available)
const TodoOption1 = new Item ({
  name: "Welcome to your todolist!"
});

const TodoOption2 = new Item ({
  name: "Hit the + button to add a new item."
});

const TodoOption3 = new Item ({
  name: "Check the box to delete a item."
});

// this is the collection of documents that we created early we format them in form of array so that it may easy to use them
const defaultTodoOption = [TodoOption1, TodoOption2, TodoOption3];


// get function is used to send GET request to server. so that it render some file (HTML or EJS) to our Path or Route that is "/" in this condition.
app.get("/", function(req, res) {
  // render function render date to appropriate ejs file(in this case LISTS), and pass data along with define variables.
  const day = date.getDay();
  
  // find() function of mongoose, to check the documents from collections 
  Item.find({},function(err, dataitems){
   
    if(dataitems.length == 0){
      
      // if the query matches then another mongoose function will run which insert some documents that we created earlier and saved them in form of array
      Item.insertMany( defaultTodoOption, function(err){
        
        // if there is any err then it'll show that error else it shows the appropriate code msg
        if (err){
          console.log(err);
        } else {
          console.log("Inserted all the Documents to the Database.");
        }
      })
      // redirct funcion is used to send the server (automationclly) to the given url
      res.redirect("/"); 
    } else{
      // this render the ejs template with comstomization to the server
      res.render('lists', {
        listTitle: day,
        todo_Data: dataitems
      }); 
    }
  });
});

// this is another Get route to render some html or ejs template to some http address
app.get('/:customListName', function (req, res) {

  // this constant variable is using _.capatialize() function so that it can manage and format all the words in same form(improve robustness)
  const customListName = _.capitalize(req.params.customListName);

  // checker checks that if the page is main page or custom page (1 means main page 0 means custom page)
  checker = listtitle(customListName);
  if(!checker){

    // findOne function takes two arguments mainly (one for on what are the condition and second for the callback)
    List.findOne({name: customListName}, function(err, foundlist){
      if(!err){
        if(!foundlist){
          // create a list inside list collection
          const clist = new List ({
            name: customListName,
            items: defaultTodoOption
          })
          // save functon is used so that it save the list(document) to database
          clist.save();
          res.redirect("/" + customListName);
        }
        else {
          // render the existed list
          res.render("lists", {
            listTitle: customListName,
            todo_Data: foundlist.items
          });
        }
      }
    });
  }
  else{
    // render this about page if custom names matches with weekdays(because we uses date function to take dynamic day) so if user makes the todo with the weekday(as name) then it render this page which tells him to use another name
    res.render("about");
  }
});

// post method is used to send the data back when the post route is triggered by appropriate HTML
app.post("/", function(req, res) {
  const itemName = req.body.Todo_Item; //Tells the value to be add
  const pageName = req.body.button; //Tells the list title
  const checkData = date.checkValue(itemName); //Varify the inputed value
  checker = listtitle(pageName); //takes 1 or 0 (1 for if todo is default todo and 0 for custom todo)
  
  // this function checks that if checkdata doesnot matches(means input todo is not space) then creat a document for that input
  if(!checkData){
    // it create another document from default item schema
    const list = new Item ({
      name: itemName
    });

    // now if it is in default todo then save else do the directed
    if(checker){
      list.save();;
      res.redirect("/");
    }
    else{
      // findOne is used to find the todo page in which the post request in encountered
      List.findOne({name: pageName}, function(err, foundDocument){
        // after finding the document insert(push because its an array) the list document, you can use any method to insert the document
        foundDocument.items.push(list);

        // after inserting document save it to the database
        foundDocument.save();

        // and redirct to the same page from the request is encountered

        res.redirect("/" +pageName);
     });
    }  
  }
  else {
    // this will tell that if the input is just a black space then don't insert just redirect to same page
    if(checker){
      res.redirect("/");
    }
    else{
      res.redirect("/" +pageName);
    }
  }
});

// this post request is receiving request from all the pages and deletes the data for that the post request is encountered
app.post("/del", function(req, res) {
  const checkedData = req.body.checkedBox; //takes the name of the document which needs to be deleted
  const page = req.body.hPageName;  // tells which page requested a post request to delete the document
  checker = listtitle(page);  // checks weather the page is default or is custom page

  // if checker is 1 means we are on default page then just follow this function else below one .
  if(checker){ 

    // this function find the document from default list (Item) and remove it from mongoose method findByIdAndRemove
    Item.findByIdAndRemove(checkedData, function(err){

      // if there were no errors then just display successful msg and redirect to same page
      if(!err){
         console.log("Successfully Deleted!");
         res.redirect("/");
        }
    });
  }
  // this code snippet takes action when the delete request is arrived from custom pages it checks first from which page the delete request
  // is encountered then it uses another mongoose operator to delete document from list from list array from document (just customlist document)
  else {
    // $pull functon works as first its name then it takes an array from the data need to be deleted{item:{_id: checkedData}}, then the condition
    // that tells which should be deleted({_id: checkedData)})
    List.findOneAndUpdate({name: page}, {$pull: {items:{_id: checkedData}}}, function(err, foundDocument){
      if(!err){
        res.redirect("/" +page);
      }
    });
  }
});

// this function tells weather the name that the user tries to acces is valid or not!
// simply it works as if the name matches with any of our default names the it breaks the loop and put 1 in count  else 0 in count
// count is returend to the calling function. (if count is equal to 1 then it matches else doesn't matches)
function listtitle(customListNames){
  let count = 0;
   for(let i =0; i<defaultName.length; i++){
    if(customListNames === defaultName[i]){
      // name matches render about page
      count = 1;
      break;
    }
  }
  return count;
}

// listen funtion is used to set the path(in this the address of local port, in this case 3000)
app.listen("3000", () => {
  console.log("server is running at port 3000");
});
