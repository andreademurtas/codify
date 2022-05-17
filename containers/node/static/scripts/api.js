function getOutput(){
    var body = {
        "code":  $('#textareaCode').val(),
        "language": $('#language').val()
    };
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var response = JSON.parse(this.responseText).output;
            var x = document.getElementById("textarea_outputCode");
            x.value = response;
        }
    };
    xhttp.open("POST", '/getOutput', true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.send(JSON.stringify(body));
}



function excecute_request1() {
    // inizializzo le variabili per la richiesta all'api
    const CODE_EVALUATION_URL = 'https://api.hackerearth.com/v4/partner/code-evaluation/submissions/';
    const CLIENT_SECRET = '8af269c1c8a2c651ef3d530cd5721155e2319df1';
    var source =  $('#textareaCode').val(); 
    var lang = $('#language').val();
    var source = {source: source , lang: lang};
    if(source.source == ''){
        alert("There is no code to compile");
    }
    // invio la richiesta al server
    $.ajax({
        type: 'POST',
        url: CODE_EVALUATION_URL,
        headers:{"client-secret": CLIENT_SECRET,
                'Access-Control-Allow-Origin': '*'},
        data: source,
        success: function(response){  
            result = JSON.stringify(response);
            alert(result)
            const STATUS_UPDATE_URL = response.status_update_url;
            get_status(STATUS_UPDATE_URL);
        }
    });   
}

function get_status(link){
    // richiedo lo stato della richiesta fino a che non è pronto l'output
    const CLIENT_SECRET = '8af269c1c8a2c651ef3d530cd5721155e2319df1';
    headers = {'client-secret': CLIENT_SECRET};
    $.ajax({
        type: 'POST',
        url: link,
        headers:{"client-secret": CLIENT_SECRET, 'Access-Control-Allow-Origin': 'http://localhost'},
        success: function(response){
            if (response.request_status.code != "REQUEST_COMPLETED"){
                // get_status(link);
                alert(JSON.stringify(response));
                alert(response.request_status.code);
                setTimeout(() => {  get_status(link); }, 5000);
                return 0;
            }
            const OUTPUT_LINK = response.result.run_status.output;
            download_output(OUTPUT_LINK);
        }
    });
}

function download_output(link){
    // scarico il risultato della richiesta e lo stampo a schermo
    $.ajax({
        type: 'GET',
        url: link, 
        success: function(response){
            var x = document.getElementById("textarea_outputCode");
            x.value = response;
        }
    });
}

function excecute_request1() {
    // inizializzo le variabili per la richiesta all'api
    var axios = require('axios');
    var data = JSON.stringify({
            "code":`public class program{
                        public static void main(String [] args){
                            System.out.println(5+5+6);
                        }
                        }`,
            "language":"java",
            "input":""
            });

    var config = {
    method: 'post',
    url: 'https://codexweb.netlify.app/.netlify/functions/enforceCode',
    headers: { 
        'Content-Type': 'application/json'
    },
    data : data
    };

    axios(config).then(function (response) {
    console.log(response.data);
    })
    .catch(function (error) {
    console.log("Errore: " +error);
    });
}



// function getResult1(){
//     var code =  $('#textareaCode').val(); 
//     var language = $('#language').val();
//     var data = JSON.stringify({
//         "code":code,
//         "language":language,
//         "input":""
//     });
//     var config = {
//     method: 'post',
//     url: 'https://codexweb.netlify.app/.netlify/functions/enforceCode',
//     headers: { 
//         'Content-Type': 'application/json'
//     },
//     data : data
//     };
//     axios(config)
//     .then(function (response) {
//     console.log(response.data);
//     })
//     .catch(function (error) {
//     console.log(error);
//     });
// }