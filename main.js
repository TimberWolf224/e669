var verboseOutput = true;
var currentPage = 1;

var grid = $(".grid");

// initialize Masonry
grid.masonry({
  // options
  itemSelector: ".grid-item",
  columnWidth: 300,
  gutter: 10
});

function getSearchQuery() {
  // clear current grid
  grid.masonry("remove", grid.find(".grid-item"));

  // obtain tag query
  var tags = document.getElementById("tags").value;
  const statusDiv = document.getElementById("status"); // div on page to append results

  // Loading indicator
  statusDiv.innerHTML = "<b>Loading, please wait...</b>";

  // make array of tags
  var splitTags = tags.split(" ");
  verboseLog(
    "User searched with tags:\n" +
      splitTags +
      "\nArray length: " +
      splitTags.length
  );

  // check if there are more than 6 tags
  if (splitTags.length > 6) {
    // let user know this is too many tags
    statusDiv.innerHTML =
      "<b>Your fetishes are getting really specific.</b><br/>7+ tag searches are still a work in progress. For now, keep your searches at 6 tags or less!";
  } else {
    // check desired results size
    var resultSize = document.getElementById("resultAmount").value;
    if (resultSize === "") resultSize = 20;

    // URL to request results from
    var requestURL =
      "https://cors-anywhere.herokuapp.com/https://e621.net/post/index.json?limit=" +
      resultSize +
      "&page=" + // TODO: replace this service with own service
      currentPage +
      "&tags=" +
      tags;

    // create request
    verboseLog("creating request to " + requestURL);
    var request = new XMLHttpRequest();
    request.open("GET", requestURL);
    request.responseType = "json";
    request.send();

    // once request loads
    request.onload = function() {
      verboseLog("Request has loaded");
      var results = request.response;

      appendResultsToPage(results); // Add results to page
      statusDiv.innerHTML = "";
    };
  }

  // add all results to page
  function appendResultsToPage(resultsArray) {
    resultsArray.forEach(function(result) {
      // convenience variables
      const fileUrl = result["file_url"];
      const fileName = result["artist"] + " - " + result["md5"];
      const fileType = result["file_ext"];
      const authorName = result["artist"];
      const pageUrl = "https://e621.net/post/show/" + result["id"];

      verboseLog("Appending image:\n" + fileUrl + "\n" + fileName);

      // check if file is an SWF or WEBM
      if (fileType === "webm") {
        // TODO: implement webm functionality for masonry
        // asdf
      } else if (fileType === "swf") {
        // TODO: implement swf functionality for masonry
        // blegh
      } else {
        // this is an image
        var link = document.createElement("a");
        link.href = fileUrl;
        var image = document.createElement("img");
        image.classList.add("grid-item");
        image.src = fileUrl;
        link.appendChild(image);

        $(".grid")
          .append(link)
          .masonry("appended", link)
          .imagesLoaded()
          .progress(function() {
            $(".grid").masonry();
          });
      }
    });
  }
}

/*
// GENERAL HELPER FUNCTIONS
*/

// create HTML code for a card object
function createCard(imageUrl, authorName, pageUrl) {
  var htmlText =
    "" +
    '<div class="grid-item" style="float: left;">' +
    '<div class="card" >' +
    '<div class="card-image waves-effect waves-block waves-light">' +
    "<img class='activator' src='" +
    imageUrl +
    "'>" +
    "</div>" +
    "<div class='card-content'>" +
    "<span class='card-title activator grey-text text-darken-4'>" +
    authorName +
    '<i class="material-icons right">more_vert</i></span>' +
    '<p><a href="' +
    pageUrl +
    '">Page</a></p>' +
    "</div></div></div>";

  return htmlText;
}

// advance to next page and automatically reload results
function pageNext() {
  verboseLog("User is moving to next page");
  currentPage++;
  updatePageNumber();
  getSearchQuery();
}

// go to previous page and automatically reload results
function pagePrevious() {
  verboseLog("User is moving to previous page");
  if (currentPage > 1) currentPage--;
  updatePageNumber();
  getSearchQuery();
}

// update the displayed page number
function updatePageNumber() {
  pageNumberElement = document.getElementById("pageNumber").innerText =
    "Page " + currentPage;
}

// Print to console only if verbose output is enabled
function verboseLog(text) {
  if (verboseOutput) console.log(text);
}

// enable enter key functionality on search box
document.getElementById("tags").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    getSearchQuery();
  }
});
