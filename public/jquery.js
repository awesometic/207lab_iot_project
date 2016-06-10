$(document).ready(function() {

    $(document).ready(function(){
        $("#p1").mouseenter(function(){
            alert("You entered p1!");
        });
    });
    $(document).ready(function(){
        $('[data-toggle="popover"]').popover({ trigger: "hover" });
    });

});
