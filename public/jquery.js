$(document).ready(function() {

    $("#login-open-modal").click(function(){
        $("#login-join-modal").modal();
    });

    $("#main-beacon-list").load("beacon/beacon_list.ejs", function(data) {
        $("#main-beacon-list").html(data);
    });

    $("#main-workplace-list").load("workplace/workplace_list.ejs", function(data) {
        $("#main-workplace-list").html(data);
    });

    $("#main-employee-list").load("employee/employee_list.ejs", function(data) {
        $("#main-employee-list").html(data);
    });
});
