var axios = require('axios');

async function getResult(code, language){
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