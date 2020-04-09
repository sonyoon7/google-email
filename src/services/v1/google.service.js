const fs = require('fs')
const util = require('util')
const base64 = require('js-base64').Base64;
const { google } = require('googleapis')
const htmlToText = require('html-to-text');

const readFile = util.promisify(fs.readFile)

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.settings.basic'
    ]


const TOKEN_PATH = 'token.json'

const getCredentials = async () => {
  const credential = await readFile(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  return JSON.parse(credential)
}

export const getOAuth2Client = async () => {
  const credentials = await getCredentials()
  const { client_secret, client_id, redirect_uris } = credentials.web
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  return oAuth2Client
}

export const authorize = async () => {
  const oAuth2Client = await getOAuth2Client()
  let token
  try {
    token = await readFile(TOKEN_PATH)
    oAuth2Client.setCredentials(JSON.parse(token))

    return oAuth2Client
  } catch (e) {
    return new Promise((resolve, reject) => {
      reject(new Error(e))
    })
  }
}

export const getAuthUrl = (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  return authUrl
}

export const getAccessToken = async (code) => {
  const oAuth2Client = await getOAuth2Client()
  const { tokens } = await oAuth2Client.getToken(code)
  // if you want to get refresh Token,
  // check out if your app is already registered of not on "https://myaccount.google.com/u/0/permissions" remove that and try again
  try {
    oAuth2Client.setCredentials(tokens)
    fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), (err) => {
      if (err) return console.error(err)
      console.log('Token stored to', TOKEN_PATH)
    })
  } catch (error) {
    console.error('Error retrieving access token', error)
  }
  return oAuth2Client
}

const getStartPageToken = async (drive) => {
  const startPageToken = await drive.changes.getStartPageToken({})
  return startPageToken.data.startPageToken
}

export const watch = async () => {
  const auth = await authorize()
  const drive = google.drive({ version: 'v3', auth })

  const PageToken = await getStartPageToken(drive)
  // console.log(PageToken)
  const changeList = await drive.changes.list({
    pageToken: PageToken
    // fields: 'nextPageToken, changes(changeType, time, fileId, file(name, modifiedTime, webViewLink))'
  })
  return new Promise(resolve => {
    resolve(changeList.data.changes)
  })
}

/**
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export const listFile = async () => {
  const auth = await authorize()
  const drive = google.drive({ version: 'v3', auth })
  const res = await drive.files.list({
    q: 'name contains "monoVS" and not name contains "morph" and not name contains "bifacialDaily" and mimeType != "application/vnd.google-apps.folder"',
    fields: 'files(id, name, mimeType, modifiedTime)'
  })

  try {
    // console.log(res.data)
    return new Promise(resolve => {
      resolve(res.data.files)
    })
  } catch (error) {
    return console.log('The API returned an error: ' + error)
  }
}

export const listLabels = async () => {
  const auth = await authorize()
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

export const searchMailBox = async () => {
  const auth = await authorize()
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.messages.list({
    userId: 'me',
    // pageToken: PageToken,
    // q: `in:sent after:2020/03/10`
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log(res.data)
  });
}

export const getMessages = async () => {
  const auth = await authorize()
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.messages.get({
    userId: 'me',
    id: '170ada72ea9ee29b',
    // format: 'raw'

    // pageToken: PageToken,
    // q: `in:sent after:2020/03/10`
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    // console.log(res.data.raw)

    console.log(res.data.payload.parts)

    res.data.payload.parts.forEach(part => {
      if(part.body.data){
        let arr = part.body.data.split('-')
        arr.forEach(data =>{
          console.log(base64.decode(data))
        })

        // if(part.mimeType === 'text/html'){
        //   arr.forEach(data =>{
        //     console.log(base64.decode(htmlToText.fromString(data)))
        //
        //   })
        // }
      }

    })


  });
}
