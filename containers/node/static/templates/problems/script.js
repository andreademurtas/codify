function getProblems(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText).challenges;
            for (chall of res){
                var response = chall.title;
                var id = chall.title.split(" ")[1];
                console.log(chall); 
                $(".grid-container").append("<div class=\"grid-item\"><a href=\"/challenge?id="+id+"\">"+response+"</a></div>");
            }
        }
    };
    xhttp.open("GET", '/getChallenges', true);
    xhttp.send();
}