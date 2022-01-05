const axios = require('axios').default
module.exports = {
    async executeAPICalls(req, h, options) {
        return new Promise(resolve => {
            try {

                var data = JSON.stringify(options.body);
                var config = {
                    method: options.method,
                    url: options.uri,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: data
                };

                axios(config)
                    .then(async function (response) {

                        resolve({
                            respStatus: true,
                            respError: null,
                            statusCode: 200,
                            body: response.data
                        })
                    })
                    .catch(async function (error) {

                        resolve({
                            respStatus: false,
                            respError: error,
                        })
                    });
            } catch (error) {
                console.log('err', error)
                console.log('333')
                return resolve({
                    respStatus: false,
                    msg: 'server down msg'
                })
            }
        })
    }
}