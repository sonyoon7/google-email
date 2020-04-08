/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import { getAccessToken, getAuthUrl, getOAuth2Client } from '../../services/v1/google.service'

export const getToken = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.query.code)
  try {
    await getAccessToken(req.query.code)
    return res.json({ message: 'success' })
  } catch (error) {
    console.log('getAccessToken erorr: ', error)
    return res.json({ message: 'fail' })
  }
}

export const getOAuthUrl = async (req, res, next) => {
  const oAuth2Client = await getOAuth2Client()
  return res.redirect(getAuthUrl(oAuth2Client)
  )
}
