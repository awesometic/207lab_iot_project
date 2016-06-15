$(document).ready(function() {

    var currentPath = $(location).attr("pathname");

    $("#login-open-modal").click(function(){
        $("#login-join-modal").modal();
    });
    
    switch (currentPath) {
        case "/log":

            break;
        case "/management":

            break;
    }
    
});
