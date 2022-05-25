function getProblems(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText).challenges;
            for (chall of res){
                var response = chall.title;
                var id = chall.id;
                console.log(chall); 
                $(".grid-container").append("<a class=\"grid-item\" id=\""+id+"\" href=\"/challenge?id="+id+"\" style=\"color: black; text-decoration: none; \" >"+response+"<br>"+chall.score+"</a>");
            }
        }
    };
    xhttp.open("GET", '/getChallenges', true);
    xhttp.send();
}

async function getDoneProblems(){
    const response = await fetch("/userInfo");
    var data = await response.json();
    data = data.challenges;
    for (id of data){
        $('#'+id).attr("style", "background-color: lightgreen;")
    }
}