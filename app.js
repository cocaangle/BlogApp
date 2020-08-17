var express = require("express"),
app = express(),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
bodyParser = require("body-parser"),
mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/restful_blog_app", {
 useNewUrlParser: true,
 useUnifiedTopology: true,
 useFindAndModify: false});

// app config
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

//mongoose/model config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

//restful routes

app.get("/", function(req,res){
	res.redirect("/blogs");
});

//index route
app.get("/blogs", function(req,res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("Error!");
		}else{
			res.render("index",{blogs: blogs});
		}
	});
});

//new route
app.get("/blogs/new",function(req,res){
	res.render("new");
});

//create route
app.post("/blogs", function(req,res){
	// create blog
	req.body.blog.body=req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}else{
			res.redirect("/blogs");
		}
		
	});
});

//show route
app.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show", {blog:foundBlog});
		}
	});
});

//Edit route
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit", {blog:foundBlog});
		}
	});
});

//Update Route
app.put("/blogs/:id", function(req,res){
	req.body.blog.body=req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

// Delete Route
app.delete("/blogs/:id", function(req,res){
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/");
		}
	});
});

app.listen(3000, function(){
	console.log("The server has started!");
});