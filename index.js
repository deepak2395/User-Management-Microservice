const { join } = require('path')
const queryParse = require('query-string').parse
const _ = require('ramda')
/**
 * Global Config
 */
if (process.argv[2] != '.env.prod') {
  require('dotenv').config({
    path: join(__dirname, `${process.argv[2]}`)
  })
}

/* let setEnv = async function () {
  try {
    let dotenv = require('dotenv')
    let CryptoJS = require('crypto-js')
    var request = require('request-promise')
    let envData = await request('http://10.86.6.21/env?fileName=user')
    // let envData = await request('http://localhost:2020/env?fileName=user')
    let bytes = CryptoJS.AES.decrypt(
      envData,
      'DRNouR0MbItGAxC8wPoiUWYeCedstNH2S'
    )
    envData = bytes.toString(CryptoJS.enc.Utf8)
    envData = dotenv.parse(JSON.parse(envData).data)
    for (let key in envData) {
      process.env[key] = envData[key]
    }
  } catch (err) {
    // console.log(JSON.stringify(err), 'ENV_API_DECRYPTED_ERROR')
    process.exit(1)
  }
} */

const startServer = async function () {
  /*   if (process.argv[2] == '.env.prod') {
      await setEnv()
    } */

  const Glue = require('@hapi/glue')
  const serverConfig = require('./config')
  const { unsupportedMediaType } = require('@hapi/boom')

  try {
    const options = {
      relativeTo: __dirname
    }
    const manifest = await serverConfig.manifest()
    const server = await Glue.compose(manifest, options)

    await server.start()
    //  server.connection({ routes: { cors: true } })
    const secureApi = {
      encryptRes: () => {
        server.ext('onPreResponse', async (req, h) => {
          req.user = req.user || {}
          console.log('1')
          return h.response(responseData.data).code(responseData.statusCode)
        })
      },
      decryptReq: () => {
        // Request Decryption
        server.ext('onPostAuth', (req, h) => {
          console.log('2')
        })
      }
    }
    if (process.env.REQ_DECRYPTION == 'true') {
      // console.log('REQ_DECRYPTION')
      secureApi.decryptReq()
    }
    if (process.env.RES_ENCRYPTION == 'true') {
      // console.log('RES_ENCRYPTION')
      secureApi.encryptRes()
    }

    // Handling Internal Server Error
    if (process.env.RES_ENCRYPTION != 'true') {
      server.ext('onPreResponse', async (req, h) => {
        let currentResponse = req.response || {}
        let responseData = {
          data: null,
          statusCode: 200
        }
        // Check Error
        if (currentResponse.isBoom == true) {
          responseData.data = getObjValue(currentResponse, [
            'output',
            'payload'
          ])
          responseData.statusCode = getObjValue(currentResponse, [
            'output',
            'statusCode'
          ])
        }
        // Check Success
        else {
          responseData.data = currentResponse.source
          responseData.statusCode = currentResponse.statusCode
        }
        // console.log(responseData, 'response payload')

        // Custom Error Message for Internal Server Error
        if (responseData.statusCode === 500) {
          let errData = {
            msg: "Overwhilming Kindly try again later"
          }
          responseData.data.error = errData.msg
          responseData.data.message = errData.msg
        }
        if (responseData.statusCode === 401) {
          let errData = {
            msg: "Invalid Pin"
          }
          responseData.data.error = errData.msg
          responseData.data.message = errData.msg
        }
        return h.response(responseData.data).code(responseData.statusCode)
      })
    }
    if (process.env.REQ_DECRYPTION != 'true') {
      server.ext('onPostAuth', (req, h) => {
        console.log('4', req.response)
        return h.continue
      })
    }

    // console.log = () => { }

    console.log(`Server listening on ${server.info.uri}`)
    console.log("connected to port", process.env.PORT)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

startServer()
function getObjValue(object, keys, d = null) {
  return _.pathOr(d, keys, object)
}
