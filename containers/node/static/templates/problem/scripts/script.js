// permette di mettere il tab 
function get_tab(){    
    document.getElementById('textareaCode').addEventListener('keydown', function(e) {
        // e.sopPropagation();
        if (e.key == 'Tab') {
            e.preventDefault();
            var start = this.selectionStart;
            var end = this.selectionEnd;
            this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
            this.selectionStart=start+1;
            this.selectionEnd=start+1; 
        }
        else if ("'\"([{".includes(e.key)){
            var key = e.key;
            if (key == '(') key = ')';
            if (key == '[') key = ']';
            if (key == '{') key = '}';
            var start = this.selectionStart;
            var end = this.selectionEnd;
            this.value = this.value.substring(0, start) + key + this.value.substring(end);
            this.selectionStart=start;
            this.selectionEnd=start; 
        }
    });
}

function prevent(){
    document.getElementById('button_run').addEventListener("click", function(e){e.preventDefault();});
    document.getElementById('button_check').addEventListener("click", function(e){e.preventDefault();});
}


function cambio_linguaggio(linguaggio){
    var x = document.getElementById("textareaCode");
    if (linguaggio == ""){
        x.value = "Scegliere la lingua...";
    }
    else if (linguaggio == 'c'){
        x.value = "#include <stdio.h>\nint main(){\n    printf(\"Hello World\");\n}";
    }
    else if (linguaggio == 'cpp'){
        x.value = "#include <iostream>\nint main(){\n\tstd::cout << \"Hello World!\";\n}";
    }
    else if (linguaggio == 'csharp'){
        x.value = "using System;\nclass GFG {\n\tstatic public void Main(String[] args){\n\t\tConsole.WriteLine(\"Main Method\");\n\t}\n}";
    }
    else if (linguaggio == 'java'){
        x.value = "public class program{\n    public static void main(String [] args){\n        System.out.println(\"Hello World\");\n    }\n}";
    }
    else if (linguaggio == 'python3'){
        x.value = "print(\"Hello World\")";
    }
    else if (linguaggio == 'ruby'){
        x.value = "puts \"Hello World\"";
    }
    else if (linguaggio == 'kt'){
        x.value = "fun main(args : Array<String>) {\n\tprintln(\"Hello, World!\")\n}";
    }
    else if (linguaggio == 'swift'){
        x.value = "print(\"Hello, World!\") ";
    }
    else{
        x.value = "";
    }
}



function get_problem(){
    var id = parseInt(window.location.search.split("=")[1]);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var res = JSON.parse(this.responseText);
            // console.log(res.description)
            $("#iframeCode")[0].value = res.description;
            $("#iframeCode").attr("id_challenge", id.toString());
            $("#iframeCode").attr("score", res.score);
            $('.Score')[0].innerHTML = res.score.toString() + " punti";
            challenge_risolta();
            if (id == 1){
                $(".previous").attr("style", "display:none;");
            }
            else{
                $(".previous").attr("style", "display:block;");
            }
            if (id == 8){
                $(".next").attr("style", "display:none;");
            }
            else{
                $(".next").attr("style", "display:block;");
            }
        }
    };
    xhttp.open("GET", '/getChallenge?id='+id.toString(), true);
    xhttp.send();
}

function check_result(){
    var id = $("#iframeCode").attr("id_challenge");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            if ($("#textarea_outputCode")[0].value.trim() == res.answer){
                aggiungiChallenge(id);
                $('.challenge_risolta').attr("style", "display: block;")

                // invia al server che l'utente ha risolto la challenge
            } else{
                alert("Risultato sbagliato");
            }
        }
    };
    xhttp.open("GET", '/getChallenge?id='+id.toString(), true);
    xhttp.send();
}

async function aggiungiChallenge(id){
    const response = await fetch("/addChallenge?id="+id+"&score="+$("#iframeCode").attr("score"));
    data = await response.json();
}

async function challenge_risolta(){
    var id = $("#iframeCode").attr("id_challenge");
    const response = await fetch("/userInfo");
    data = await response.json();
    data = data.challenges;
    var risolta = false;
    for (id_challenge of data){
        if (id_challenge == id){
            console.log(id_challenge);
            risolta = true;
            break;
        }
    }
    if (risolta)
        $('.challenge_risolta').attr("style", "display: block;")
    else
        $('.challenge_risolta').attr("style", "display: none;")
}
