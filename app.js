const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
var items = [];
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aniketh:<Pswd>@cluster0.lzrxdff.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const listSchema ={
    name: String,
    items:[itemsSchema]
}

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todo list!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];
app.get("/", function (req, res) {
    Item.find((err, result) => {
        if (result.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully saved");
                }
            });
            res.redirect("/");
        } else {
            console.log(result);
            res.render("list", { listTitle: "Today", newListItems: result });
        }
    });
});

app.get("/:customListName", function (req, res) {
    customListName =_.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            if(!result){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                console.log("Already Exists");
                res.render("list", { listTitle: result.name, newListItems: result.items});
            }
        }
    });
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const list  = req.body.list;
    const item = new Item({
        name: itemName
    });
    if(list === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name : list},(err,foundList)=>{
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+list);
            }
        })
    }
});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,(err)=>{
            if (err){
                console.log(err);
            }else{
                console.log("successfully deleted");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+customListName);
            }
        });
    }
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started.");
});

