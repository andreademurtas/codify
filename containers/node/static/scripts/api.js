function excecute_request() {
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
            const STATUS_UPDATE_URL = response.status_update_url;
            get_status(STATUS_UPDATE_URL);

            // alert(JSON.stringify(response.result));
            // if (response.result.request_status.code != 'REQUEST_COMPLITED') {
            //     const STATUS_UPDATE_URL = response.status_update_url;
            //     get_status(STATUS_UPDATE_URL);
                
            // }
            
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
        headers:{"client-secret": CLIENT_SECRET},
        success: function(response){
            if (response.request_status.code != "REQUEST_COMPLETED"){
                get_status(link);
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