$(document).ready(function () {

    let current_user = "user";

    // Add the onclick listener to the navigation menu.
    $(".nav-link").on('click', function() {
        $(".nav-link").removeClass("active");
        $(this).addClass("active");
        setState($(this).data("user"));
    });

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getFromPercentage(percentage) {
        if (percentage > 88) {
            return ["green", "success", "Perfect sauna experience"];
        } else if (percentage > 75) {
            return ["orange", "warning", "Degraded sauna experience"];
        } else {
            return ["red", "danger", "Poor sauna experience"];
        }
    }

    function updateTitle(percentage = null) {
        let text = "";
        switch (current_user) {
            case 'user':
                text = (percentage != null ? getFromPercentage(percentage)[2] : "");
                break;
            case 'manager':
                text = "Similarity to the optimum";
                break;
        }
        $("#title").text(text);
    }

    function updateMessages() {
        $.ajax({
            method: "GET",
            url: "https://us-central1-junction-2018.cloudfunctions.net/get-percentage?user=" + current_user,
            dataType: "json"
        }).done(function (data) {
            let percentage = Math.floor(data.percentage * 100);
            let percentage_string = percentage + "%";
            let fromPercentage = getFromPercentage(percentage);
            $("#progress .progress-bar")
                .removeClass("bg-danger bg-warning bg-success")
                .addClass("bg-" + fromPercentage[1])
                .width(percentage_string)
                .text(current_user !== "user" ? percentage_string : "");
            $("#smiley").attr("src", "./img/smiley-" + fromPercentage[0] + ".png");

            // clear the existing list
            $('#messages div').remove();

            $.each(data.message, function(index, m) {
                $('#messages').append('<div class="alert alert-'+fromPercentage[1]+'" role="alert">'+m+'</div>')
            });

            updateTitle(percentage);
        }).fail(function () {
            $("#messages").append("<div class='alert'>No messages</div>");
        });
    }

    function setState (user) {
        current_user = user;

        // Update the header.
        $("#user").text(capitalizeFirstLetter(user) + "s");

        // Reset back to loading state.
        $("#smiley").attr("src", null);
        $("#progress .progress-bar")
                .removeClass("bg-danger bg-warning bg-success")
                .width("100%")
                .text("Loading...");
        $("#messages").text("");

        updateTitle();
        updateMessages();
    }

    setState("user"); // Set the initial state.
    setInterval(updateMessages, 10000);
});