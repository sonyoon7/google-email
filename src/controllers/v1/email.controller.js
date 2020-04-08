import {listLabels, searchMailBox, getMessages} from '../../services/v1/google.service';

export const getlistLabels = async (req, res, next) => {
    // const oAuth2Client = await getOAuth2Client()
    listLabels()
    return res.json({message: "success"})
}

export const getFilteredMailbox = async (req, res, next) => {

    searchMailBox()

    return res.json({message: "success"})
}

export const getMessage = async (req, res, next) => {
    getMessages()

    return res.json({message: "success"})

}
