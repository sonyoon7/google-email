import express from 'express'
import { getlistLabels, getFilteredMailbox, getMessage } from '../../controllers/v1/email.controller'

const router = express.Router()

router.route('/')
  .get(
      getlistLabels
  )

router.route('/filter')
    .get(
        getFilteredMailbox
    )

router.route('/message')
    .get(
        getMessage
    )

export default router
