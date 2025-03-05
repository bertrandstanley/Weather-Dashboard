import { Router } from 'express';
import weatherRoutes from './weatherRoutes.js';
import htmlRoutes from '../htmlRoutes.js';

const router = Router();

// Mount weather API routes at /weather
router.use('/api', weatherRoutes);
// Mount HTML routes at root
router.use('/', htmlRoutes);

export default router;

