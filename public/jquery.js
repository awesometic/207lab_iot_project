$(document).ready(function() {

    $("#login-open-modal").click(function(){
        $("#login-join-modal").modal();
    });

    $("#sidenav-management").delegate(".sidenav-management-list", "click", function() {
        var title = this.title;

        switch (title) {
            
            case "beacon":
                $("#main-info-container").load("main_beacon.ejs");
                $("#beacon-detail").css("display", "none");
                $("#beacon-add").css("display", "none");
                break;
            case "workplace":
                $("#main-info-container").load("main_workplace.ejs");
                break;
            case "employee":
                $("#main-info-container").load("main_employee.ejs");
                break;

            default:
                alert("오류가 발생했습니다!");
                break;
        }
    });

});
