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
        else if ("'\"(".includes(e.key)){
            var key = e.key;
            if (key == '(') key = ')';
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
    if (linguaggio == 'Python'){
        x.value = "print(5 + 10)";
    }
    else if (linguaggio == 'C'){
        x.value = "int main(){\n\n}";
    }
    else if (linguaggio == 'Java'){
        x.value = "public int main(){\n\nreturn 0;\n}";
    }
    else{
        x.value = "Scegliere la lingua...";
    }
}



function get_problem(id=1){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            // console.log(res.description)
            $("#iframeCode")[0].value = res.description;
            $("#iframeCode").attr("idd", id.toString());
            if (id == 1){
                $(".previous").attr("style", "display:none;");
            }
            else{
                $(".previous").attr("style", "display:block;");
            }
            if (id == 3){
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
    var id = $("#iframeCode").attr("idd");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            if ($("#textarea_outputCode")[0].value.trim() == res.answer){
                alert("Risultato esatto");
                // invia al server che l'utente ha risolto la challenge
            } else{
                alert("Risultato sbagliato");
            }
        }
    };
    xhttp.open("GET", '/getChallenge?id='+id.toString(), true);
    xhttp.send();
}