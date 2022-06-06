var axios = require('axios');


async function getResult(code, language, version){
    var data = JSON.stringify({
        "clientId": "849413df6cbc2c9c56138e073a615196",
        "clientSecret": "55e44e2169b75ef6c73b306b9e92135c2f16c16c35f34865969565f13e83f38e",
        "script":code,
        "stdIn": "",
        "language":language,
        "versionIndex": version
        });
    var config = {
        method: 'post',
        url: 'https://api.jdoodle.com/v1/execute',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };
    var response = await axios(config).catch(error => {throw error});
    return response.data;
}

exports.getResult = getResult;