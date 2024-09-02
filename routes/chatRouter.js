import { Router } from 'express';
import { createChat } from '../controllers/chat.js';

const chatRouter = Router();

chatRouter.post('/completion', createChat);

export default chatRouter;