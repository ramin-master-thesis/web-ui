var partitionDegree = {};
var rows = []
$(document).ready(function () {

  $(".dropdown-menu li a").click(function () {
    var selText = $(this).text();

    $("#dropdownMenuButton1").html(selText);

    addEmbedingOfUser(selText)
    updateUserInterests(selText)
    updateTables('5000', "single-partition", selText)
    updateTables('5001', "murmur2-partition-0", selText, ()=> {
      updateTables('5002', "murmur2-partition-1", selText, ()=> {
        disableLowDegree("murmur2-partition-0", "murmur2-partition-1")
      })
    })
    updateTables('5003', "star-space-partition-0", selText, ()=> {
      updateTables('5004', "star-space-partition-1", selText, ()=> {
        disableLowDegree("star-space-partition-0", "star-space-partition-1")
      })
    })
    
  })

  const addEmbedingOfUser = function (userID) {
    $("#user-embedding").html("");
    if (userID == 12) {
      $("#user-embedding").append("<a class='twitter-timeline' data-lang='en' data-width='400' data-height='400' data-theme='light' href='https://twitter.com/jack?ref_src=twsrc%5Etfw'>Tweets by jack</a> <script async src='https://platform.twitter.com/widgets.js' charset='utf-8'></script>")
    }

    else if (userID == 2780219130) {
      $("#user-embedding").append("<a class='twitter-timeline' data-lang='en' data-width='400' data-height='400' data-theme='light' href='https://twitter.com/JoeNunya777?ref_src=twsrc%5Etfw'>Tweets by JoeNunya777</a> <script async src='https://platform.twitter.com/widgets.js' charset='utf-8'></script>")
    }

    else if (userID == 5725652) {
      $("#user-embedding").append("<a class='twitter-timeline' data-lang='en' data-width='400' data-height='400' data-theme='light' href='https://twitter.com/ericlaw?ref_src=twsrc%5Etfw'>Tweets by ericlaw</a> <script async src='https://platform.twitter.com/widgets.js' charset='utf-8'></script>")
    }
  }

  const updateUserInterests = function (userId) {
    $.getJSON("http://0.0.0.0:5000/status/degree/content/" + userId, function (data) {
      var counter = 1
      $("#table-interests").html("");
      $.each(data, function (_, val) {

        $("#table-interests")
          .append('<tr><th scope="row">' + counter + '</th><td>' + val + '</td></tr>');
        counter = counter + 1;
      });
    });
  }

  const getUserDegree = function (port, tableId, userId) {
    $.getJSON("http://0.0.0.0:" + port + "/status/degree/left-index/" + userId, function (degree) {

      $('#degree-' + tableId).html('User Degree: ' + degree);

      partitionDegree[tableId] = degree;
    });
  }

  const updateTables = function (port, tableId, userId, callback) {
    // rows = []

    $.when($.ajax("http://0.0.0.0:" + port + "/status/degree/left-index/" + userId)).then(function (degree) {
      partitionDegree[tableId] = degree;
      $('#degree-' + tableId).html('User Degree: ' + degree);

      $.when($.ajax("http://0.0.0.0:" + port + "/recommendation/salsa/" + userId + "?content=true")).then(function (recommendations) {
        $('#table-' + tableId).html("");


        $.each(recommendations, function (index) {
          row = recommendations[index]

          $('#table-' + tableId)
            .append('<li class="list-group-item d-flex justify-content-between align-items-start">' +
              '<div class="ms-2 me-auto">' + row.content + '</div> <span class="badge bg-primary rounded-pill">' + row.hit + '</span></li>');

          rows.push(row.content)
        });

        callback();
      });

    })

  };

});

const disableLowDegree = function (tableId1, tableId2) {
  if (partitionDegree[tableId1] > partitionDegree[tableId2]) {
    console.log("table 1: " + tableId1 + " is bigger")
    $('#table-' + tableId2).children().addClass("disabled");
  } else {
    console.log("table 2: " + tableId2 + " is bigger")
    $('#table-' + tableId1).children().addClass("disabled");
  }
}
