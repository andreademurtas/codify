var axios = require('axios');

async function getResult(codice, linguaggio){
    var code_param = new URLSearchParams('code='+codice);
    var code = code_param.get('code');

    var language_param = new URLSearchParams('language='+linguaggio);
    var language = language_param.get('language');
    console.log(code, language);

    var data = JSON.stringify({
            "code":code,
            "language":language,
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
    var response = await axios(config);
    return response.data;

}

exports.getResult = getResult;