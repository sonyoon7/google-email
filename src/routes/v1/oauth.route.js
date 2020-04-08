import express from 'express'
import { getToken, getOAuthUrl } from '../../controllers/v1/auth.controller'

const router = express.Router()

router.route('/')
  .get(
    getToken
  )
router.route('/url')
  .get(
    getOAuthUrl
  )

export default router
