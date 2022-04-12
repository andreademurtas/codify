


function execute_request(language){
    const request = requirejs(['request']);
    alert('Inizio')
    const CODE_EVALUATION_URL = 'https://api.hackerearth.com/v4/partner/code-evaluation/submissions/';
    const CLIENT_SECRET = '8af269c1c8a2c651ef3d530cd5721155e2319df1';

    // var source = document.getElementById("textareaCode");
    // var source_value = source.value;
    // //alert(source_value);
    var source_value = "print(5+10)";
    var data = {
        "lang": 'PYTHON',
        "source": source_value,
        "input": "",
        "memory_limit": 243232,
        "time_limit": 5,
        "callback": "https://client.com/callback/"
      };
    const headers = {'client-secret': CLIENT_SECRET};
    alert('Excecute');
    try{
        request.post({url: CODE_EVALUATION_URL, json: data, headers: headers}, (err, response) => {
            alert('Qualcosa');
            if (err){
                alert('Erroe ' + err);
            }
            else{
                alert(response.body);
                console.log(response.body);
                console.log(response.body.request_status);
                var result = response.body;
                if (result.request_status.code != 'REQUEST_COMPLITED') {
                    const STATUS_UPDATE_URL = result.status_update_url;
                    get_status(STATUS_UPDATE_URL);
                    
                }
            }
        });
    } catch(e){
        alert(e)
    }
}

function get_status(link){
    ////alert('get_status');
    const CLIENT_SECRET = '8af269c1c8a2c651ef3d530cd5721155e2319df1';
    headers = {'client-secret': CLIENT_SECRET};
    request.post({url: link, headers: headers}, (err, response) => {
        console.log('Entrato');
        var result = JSON.parse(response.body);        
        console.log("Risultato");
        console.log(result);
        if (result.request_status.code != "REQUEST_COMPLETED"){
            get_status(link);
            return 0;
        }
        const OUTPUT_LINK = result.result.run_status.output;
        download_output(OUTPUT_LINK);
    });
}

function download_output(link){
    ////alert('download_link');
    request.get({url: link}, (err2, response) => {
        var result = response.body;

        // var x = document.getElementById("textarea_outputCode");
        // x.value = result;
        alert(result);
        console.log(result);
    });
}

execute('PYTHON');