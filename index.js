import express from "express";
import bodyParser from "body-parser";
import capitalize from "capitalize";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "admin",
  port: 5432,
});

const app = express();
const port = 3000;

db.connect();

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  const countries = [];
  result.rows.forEach((country) => {
      countries.push(country.country_code);
  });
  return countries;
}

//Get home page
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  console.log(countries);
  res.render("index.ejs", {countries: countries, total: countries.length});
});

//INSERT new country
app.post("/add", async (req, res) => {
  const request = capitalize(req.body.country.toLowerCase().trim());
  const result = await db.query("SELECT country_code FROM countries  WHERE country_name = $1", [request]);
  
  if(result.rows.length !== 0){
    const data = result.rows[0];
    const new_country_code = data.country_code;
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [new_country_code]);
  }

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
