import { Router } from 'express';
import { z } from 'zod';
import { organizationController } from '../controllers/organizationController';
import { validateBody } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';
import domainRoutes from './domains'; // BARU

const router = Router();

const createOrgSchema = z.object({
  name: z.string().min(2, 'Nama organisasi minimal 2 karakter'),
});

router.post('/', authenticate, validateBody(createOrgSchema), organizationController.create);
router.get(
  '/:orgId/members',
  authenticate,
  requireRole('OWNER', 'ADMIN', 'MEMBER', 'VIEWER'),
  organizationController.listMembers
);

router.use('/:orgId/domains', domainRoutes); // BARU — nested routing

export default router;