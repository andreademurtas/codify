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
    document.getElementById("button_run").addEventListener("click", function(e){e.preventDefault();});
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