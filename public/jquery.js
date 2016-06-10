$(document).ready(function() {

    $("#open-modal").click(function(){
        $("#myModal").modal();
    });

    $("#p1").mouseenter(function(){
        alert("You entered p1!");
    });

    $('[data-toggle="popover"]').popover({ trigger: "hover" });

});
