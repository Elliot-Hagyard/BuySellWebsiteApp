express = require("express");
mongoose = require("mongoose");
app = express();
const mongodb = "mongodb://127.0.0.1:27017/store"
const port = 5000;
mongoose.connect(mongodb)
app.use(express.json());

app.listen(port);
app.use(express.static("public_html"))
const itemSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        image: String,
        price: Number,
        stat: String
    }
)
const Item = mongoose.model("item", itemSchema)
const itemKeys = ["title", "description", "image", "price", "stat"]
const userSchema = new mongoose.Schema(
    {
        username: String,
        password: String,
        listings: [mongoose.Schema.Types.ObjectId],
        purchases: [mongoose.Schema.Types.ObjectId]
    }
)
const User = mongoose.model("user", userSchema)
const userKeys = ["username", "password"]
/** Handles the repetitive logic in making simple queries
* @param {mongoose.model} model represents the model to query
* @param {Object} filter object containing the query parameters
* @param {express res object} res express result object
*/
function getItems(model, filter, res) {
    let query = model.find(filter).exec()

    query.then(a => {
        res.status(200)
        let string = ""
        res.send(JSON.stringify(a));
    })
    query.catch(a => {
        res.status(500)
        res.send("Error getting stuff db");
    });

}
// Get users
app.get("/get/users", (_, res) => {
    getItems(User, {}, res)

})
app.get("/get/items", (req, res) => {
    getItems(Item, {}, res)
});
app.get("/get/listings/:username", (req, res) => {
    getItems(User, { username: req.params.username }, res)
});
app.get("/search/users/:keyword", (req, res) => {
    getItems(User,
        { username: { $regex: new RegExp(req.params.keyword), $options: 'i' } },
        res
    );
});
app.get("/search/items/:keyword", (req, res) => {
    getItems(Item,
        { description: { $regex: new RegExp(req.params.keyword), $options: 'i' } },
        res
    );
});
app.post("/add/user", (req, res) => {

    for (key of userKeys) {
        if (req.body[key] == undefined) {
            res.status(400);
            res.send("Missing values");
            return
        }
    }
    let query = User.find({ username: req.body.username }).exec();
    query.then(users => {

        if (users.length == 0) {
            let userObject = {
                username: req.body.username,
                password: req.body.password,
                listings: [],
                purchases: []
            }
            let newUser = new User(userObject);
            newUser.save();
            res.status(200);
            res.send("User added");
            return
        }
        else {
            res.status(400);
            res.send("User already exists");
        }
    })
    query.catch(err => {
        res.status(500);
        res.send("Error checking DB");
    })

});
app.post("/add/item/:username",
    (req, res) => {

        for (key of itemKeys) {
            if (req.body[key] == undefined) {
                res.status(400);
                res.send("Missing values");
                return
            }
        }

        let newItem = new Item(
            {
                title: req.body.title,
                description: req.body.description,
                image: req.body.image,
                price: req.body.price,
                stat: req.body.stat
            }
        );
        newItem.save()
            .then(saved => {

                let query = User.findOneAndUpdate({ username: req.params.username }, { "$push": { "listings": saved } }).exec()
                query.then(saved => {

                    res.status(200)
                    res.send("Success uploading item")

                })
                query.catch(a => res.status(400) && res.send("Error finding user in DB"));
            })
            .catch(er => {
                res.status(500)
                res.send("Encountered database error")

            });
    }
);
