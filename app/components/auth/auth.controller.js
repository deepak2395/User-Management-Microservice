const fs = require('fs')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const { badRequest, unauthorized, badImplementation } = require('@hapi/boom')
const crypto = require('crypto')
const randomstring = require('randomstring')


/* Other Components */
const { helpers: userHelpers } = require('../user').contoller
const { userHelper } = require('../user/helper/index');


function authController() {
  /* Controller helper functions */
  const helpers = {
    /* Verifying JWT Token */
    verifyToken: async decoded => {

      console.log('verifyToken starting')
      let userData = await UserSession.query()
        .select('login_time')
        .eager(
          '[user_detail(selectUserFields)]', // user_vendor_session(selectVendorFields)
          {
            selectUserFields: builder => {
              builder.select(
                'name',
                'id',
                'user_account_type',
                'sec_user_type',
                'fcm_token',
                'is_principle',
                'rp_code',
                'sn_code',
                'device_os',
                'os_version',
                'device_name'
              )
            }
            // selectVendorFields: builder => {
            //   builder.select('type', 'session_id', 'updated_at')
            // }
          }
        )
        .where({
          id: decoded.sessionId,
          msisdn: decoded.msisdn,
          session_status: 1
        })
        .first()

      console.log('user data', userData)
      if (!userData) {
        return {
          isValid: false
        }
      }

      return {
        userData: decoded.email,
        isValid: true
      }
    }
  }

  /* Route hanlders */
  const handlers = {
    async createUser(req, h) {
      try {
        // Check forcelogout
        let forceLogout = await helpers.checkForceLogout()
        if (forceLogout.status) {
          return badRequest(forceLogout.errorMessage)
        }
        /**
         * API Function
         */

        let reqParams = [
          {
            name: 'msisdn',
            value: req.payload.msisdn
          }
        ]

        let options = {
          msisdn: req.payload.msisdn,
          body: vendorHelpers.genXml(reqParams, `createUser`)
        }
        let apiResponse = await vendorHelpers.hexaApiFetch(
          options,
          `createUser`,
          'HEXA',
          req
        )
        req.user = {
          msisdn: req.payload.msisdn
        }
        if (!apiResponse.status) {
          // return badRequest(apiResponse.msg)
          return response(
            h,
            apiResponse.msg,
            null,
            apiResponse.statusCode || 400
          )
        }

        // Create User Details - first time login - disable previous rec
        await UserDetail.query()
          .update({
            status: 2
          })
          .where({
            msisdn: req.payload.msisdn,
            status: 1
          })
        // Insert New User
        let newUserData = await UserDetail.query().insert({
          msisdn: req.payload.msisdn
        })
        // .then(() => {})

        userHelpers.createVasService(newUserData)

        return success(h, 'User created successfully')
      } catch (e) {
        error(e)
        return badImplementation('Something went wrong!')
      }
    },
    async forgotPassword(req, h) {
      try {
        // Check forcelogout
        let forceLogout = await helpers.checkForceLogout()
        if (forceLogout.status) {
          return badRequest(forceLogout.errorMessage)
        }
        /**
         * API Function
         */
        let randomStr = randomstring.generate({
          length: 5,
          charset: 'numeric'
        })
        let transactionId = getTransactionId()
        let reqParams = [
          {
            name: 'msisdn',
            value: req.payload.msisdn
          },
          {
            name: `requestId`,
            value: transactionId // `MOBAPP${Date.now()}-${randomStr}` // 'MOBAPP20170721132616038'
          }
        ]

        let options = {
          transactionId: transactionId,
          msisdn: req.payload.msisdn,
          body: vendorHelpers.genXml(reqParams, `forgotPassword`)
        }
        let apiResponse = await vendorHelpers.hexaApiFetch(
          options,
          `forgotPassword`,
          'HEXA',
          req
        )
        req.user = {
          msisdn: req.payload.msisdn
        }
        if (!apiResponse.status) {
          return response(
            h,
            apiResponse.msg,
            null,
            apiResponse.statusCode || 400
          )
          // return badRequest(apiResponse.msg)
        }

        return success(h, 'Pin sent successfully')
      } catch (e) {
        error(e)
        return badImplementation('Something went wrong!')
      }
    },
    async validateLogin(req, h) {

    },
    async logout(req, h) {
      try {
        /**
         * API Function
         */
        // let reqParams = [
        //   {
        //     name: 'sessionId',
        //     value: req.user.vendorSessions.hexaSessionId
        //   }
        // ]
        // let options = {
        //   msisdn: req.user.msisdn,
        //   body: vendorHelpers.genXml(reqParams, `logoff`)
        // }
        // let apiResponse = await vendorHelpers.hexaApiFetch(options, `logoff`)
        // if (!apiResponse.status) {
        //   return badRequest(apiResponse.msg)
        // }

        // Logout Internal Session
        await UserSession.query()
          .update({
            msisdn: req.user.msisdn,
            fcm_token: null,
            logout_time: moment()
              .utc()
              .format('YYYY/MM/DD HH:mm:ss'),
            session_status: 2
          })
          .where({
            id: req.user.sessionId,
            msisdn: req.user.msisdn,
            session_status: 1,
            status: 1
          })

        // Unsubscribe from FCM
        helpers.unsubscribeFromPushTopics(req.user.msisdn)

        return success(h, 'Logout Successfully')
      } catch (e) {
        error(e)
        return badImplementation('Something went wrong!')
      }
    },
    async checkValidUser(req, h) {
      try {
        return success(h, 'User is verified successfully')
        // if (process.env.SAMPLE_RESPONSE == 'true') return true
        let userData = await UserDetail.query()
          .where({
            msisdn: req.user.msisdn,
            status: 1
          })
          .orderBy('id', 'desc')
          .first()

        // Password Decryption
        try {
          var decipher = crypto.createDecipher(
            'aes256',
            process.env.ENCRYPT_KEY
          )
          var decrypted = decipher.update(userData.pin, 'hex', 'utf8')
          decrypted += decipher.final('utf8')
          userData.pin = decrypted
        } catch (err) { }

        userData.transactionId = getTransactionId()
        let apiResponse = await vendorHelpers.hexaLoginApi(userData, req) // Login check and session token returns
        if (!apiResponse.status) {
          // If user is postpaid
          if (req.user.user_account_type == 2) {
            return success(h, null)
          }
          // Logout Internal Session
          await UserSession.query()
            .update({
              msisdn: req.user.msisdn,
              fcm_token: null,
              logout_time: moment()
                .utc()
                .format('YYYY/MM/DD HH:mm:ss'),
              session_status: 2
            })
            .where({
              id: req.user.sessionId,
              msisdn: req.user.msisdn,
              session_status: 1,
              status: 1
            })
          // Channel Subscription
          helpers.unsubscribeFromPushTopics(req.user.msisdn)

          return unauthorized(apiResponse.msg)
        }

        return success(h, 'User is verified successfully')
      } catch (e) {
        error(e)
        return badImplementation('Something went wrong!')
      }
    },
    /**
     * Force Update
     */
    async appVersion(req, h) {
      try {
        // Latest Version
        let latestVersion = await AppVersion.query()
          .where({
            type: req.query.type,
            os_type: req.query.osType || 'android',
            is_current_version: 1,
            is_latest_version: 1
          })
          .first()

        // If api version and current latest version is same - return success
        if (latestVersion.version === req.query.version) {
          return success(h, '', {
            status: 0,
            message: '',
            currentVersion: null,
            osType: null
          })
        }

        // 0 - false  1- force update,  2 - partial update
        let resData = {
          status: latestVersion.update_status,
          message: latestVersion.message,
          currentVersion: latestVersion.version,
          osType: latestVersion.os_type
        }

        // If latest version is force
        // if (latestVersion.update_status === 1) {
        //   return success(h, '', resData)
        // }

        // if type fails
        // if (!req.query.type) {
        //   // req.query.osType == ''
        //   resData.status = 1 // force update
        //   resData.message = 'Please Update for better experience'
        //   return success(h, '', resData)
        // }

        // Receiving App Version
        let queryData = {
          type: req.query.type,
          os_type: req.query.osType || 'android',
          is_current_version: 1,
          version: req.query.version
        }
        // if (req.query.osType) {
        //   queryData.os_type = req.query.osType
        // }

        let versionData = await AppVersion.query()
          .where(queryData)
          .first()

        // If version not found, then force
        if (!versionData) {
          resData.status = 1
          return success(h, '', resData)
        }
        // No popup means
        if (latestVersion.update_status == 0) {
          return success(h, '', {
            status: 0,
            message: '',
            currentVersion: null,
            osType: null
          })
        }

        return success(h, '', resData)
      } catch (e) {
        error(e)
        return badImplementation('Something went wrong!')
      }
    },

    async domainMonitoring(req, h) {
      try {
        return success(h, 'Domain is up')
      } catch (e) {
        error(e)
        return badImplementation('Something went wrong')
      }
    },

    testVendor(type = null) {
      // return true

      function _randomize(api) {
        const msisdns = [
          '601161821728-201908135209'
          // '601128557586-201908135209',
          // '601128356609-201908293208',
          // '601128393569-201909171801',
          // '601128534870',
          // '60182141885-201908207801',
          // '601128380715',
          // '601128171572',
          // '601128393569',
          // '601128509972-201910037608',
          // '601128526701-201910037607',
          // '601128123014'
        ]
        const randomized = msisdns[Math.floor(Math.random() * msisdns.length)]

        const [msisdn, fspGroupId] = randomized.split('-')

        if (api === 'getFFMembers')
          return {
            msisdn,
            fspGroupId
          }
        return {
          user: {
            msisdn
          }
        }
      }

      return async (req, h) => {
        try {
          const helpers = require('../user').contoller.helpers

          const { flatten } = require('ramda')

          let HOMEPAGE_APIS = [
            'bscsCustomerInformation',
            'sdpProfileInfo',
            'contractInformation',
            'contractBarringStatus'
            // 'getMainMsisdn',
            // 'getFFMembers',
            // 'querySubscriptionForIDNum'
          ]

          if (type) {
            HOMEPAGE_APIS = HOMEPAGE_APIS.filter(api => api === type)
          }
          if (type == 'crm') {
            HOMEPAGE_APIS = ['getMainMsisdn', 'querySubscriptionForIDNum']
          }

          let calls = payloadGenerator =>
            HOMEPAGE_APIS.map(api => helpers[api](payloadGenerator(api)))

          req.query = {
            loop: 1
          }
          if (req.query.loop) {
            calls = flatten(
              Array(Number(req.query.loop))
                .fill()
                .map(_ => calls(_randomize))
            )
          }
          let resp = await Promise.all(calls)
          // resp = resp[0]

          // if (!resp.status) {
          //   return badRequest(resp.msg)
          // }

          return success(h, 'asda', resp)
        } catch (e) {
          error(e)
          return badImplementation('Something went wrong!')
        }
      }
    },
    encryptionTest(req, h) {
      try {
        return success(h, 'Encrypted data loaded successfully', {
          ...req.payload
        })
      } catch (e) {
        return badImplementation('Something went wrong')
      }
    },
    async getCluster(req, h) {
      try {
        var request = require('request-promise')
        let envData = await request(`${req.query.url}/env?fileName=user`)

        return success(h, 'success', envData)
      } catch (e) {
        return success(h, 'Err', e)
      }
    },
    async askFile(req, h) {
      try {
        const { join } = require('path')

        let file = fs.readFileSync(
          join(__dirname, '../../../static', 'log.txt')
        )
        fs.unlinkSync(join(__dirname, '../../../static', 'log.txt'))
        return h
          .response(file)
          .type('application/octet-stream')
          .header('Content-Type', 'application/octet-stream')
          .header('Content-Disposition', 'attachment; filename=staticLog.txt')
      } catch (e) {
        return success(h, 'Err', e)
      }
    },
    async askLog_Req(req, h) {
      try {
        const { join } = require('path')

        let file = fs.readFileSync(
          join(__dirname, '../../../static', 'log_request.txt')
        )
        fs.unlinkSync(join(__dirname, '../../../static', 'log_request.txt'))
        return h
          .response(file)
          .type('application/octet-stream')
          .header('Content-Type', 'application/octet-stream')
          .header(
            'Content-Disposition',
            'attachment; filename=staticLog_Request.txt'
          )
      } catch (e) {
        return success(h, 'Err', e)
      }
    }
  }

  return {
    helpers: Object.freeze(helpers),
    handlers: Object.freeze(handlers)
  }
}

module.exports = authController()
