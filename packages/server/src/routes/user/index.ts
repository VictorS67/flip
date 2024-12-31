
import express from 'express';
import { convertStringToNumberController } from '../../controllers/user/index.js';

const router = express.Router();

router.get('/ping', (req, res) => {
    res.send('pong from userRouter');
  });
router.post('/convert', convertStringToNumberController);

export default router;
