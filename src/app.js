const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;

// Use body-parser to parse POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the correct views directory path
app.set('views', path.join(__dirname, 'views'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set up in-memory lists
let itemList = [];
let needMoreList = [];

// Load items from JSON files during server initialization
loadItemsFromJson('itemList.json', itemList);
loadItemsFromJson('needMoreList.json', needMoreList);

// Serve the HTML page
app.get('/', (req, res) => {
  const debugMessage = req.query.debug ? null : req.query.debug;
  res.render('index', { itemList, needMoreList, debugMessage });
});

// Handle form submissions to update lists
app.post('/updateList', (req, res) => {
  const action = req.body.action;
  const item = req.body.item;

  const result = updateLists(action, item, itemList, needMoreList);

  return res.render('index', result);
});

// Function to update lists and write to JSON files
function updateLists(action, item, itemList, needMoreList) {
  // Handle actions for the first list
  if (action === 'add') {
    itemList.push(item);
  } else if (action === 'subtract') {
    // Check if the submitted item is present in the list
    if (!itemList.includes(item)) {
      const debugMessage = `'${item}' not found in the No More list.`;
      console.log(debugMessage);
      return { itemList, needMoreList, debugMessage };
    }

    const index = itemList.indexOf(item);
    itemList.splice(index, 1);
  }

  // Handle actions for the second list
  if (action === 'addMore') {
    needMoreList.push(item);
  } else if (action === 'subtractMore') {
    // Check if the submitted item is present in the second list
    if (!needMoreList.includes(item)) {
      const debugMessage = `'${item}' not found in the Need More list.`;
      console.log(debugMessage);
      return { itemList, needMoreList, debugMessage };
    }

    const index = needMoreList.indexOf(item);
    needMoreList.splice(index, 1);
  }

  // Write updated lists to JSON files
  writeItemsToJson('itemList.json', itemList);
  writeItemsToJson('needMoreList.json', needMoreList);

  return { itemList, needMoreList, debugMessage: null };
}

// Function to write items to JSON file
function writeItemsToJson(filename, items) {
  const filePath = path.join(__dirname, 'json', filename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing items to JSON file '${filename}':`, error.message);
  }
}

// Function to load items from JSON file
function loadItemsFromJson(filename, items) {
  const filePath = path.join(__dirname, 'json', filename);

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(data);
    items.push(...parsedData);
  } catch (error) {
    console.error(`Error loading items from JSON file '${filename}':`, error.message);
  }
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});