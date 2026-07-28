import { Router } from 'express';
import { z } from 'zod';
import { domainController } from '../controllers/domainController';
import { validateBody } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';

// mergeParams: true supaya route ini bisa baca :orgId dari parent router
const router = Router({ mergeParams: true });

const registerDomainSchema = z.object({
  hostname: z
    .string()
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/,
      'Format hostname tidak valid (contoh: example.com)'
    ),
});

router.post(
  '/',
  authenticate,
  requireRole('OWNER', 'ADMIN'), // hanya OWNER/ADMIN yang boleh daftarin domain baru
  validateBody(registerDomainSchema),
  domainController.register
);

router.get(
  '/',
  authenticate,
  requireRole('OWNER', 'ADMIN', 'MEMBER', 'VIEWER'),
  domainController.list
);

router.post(
  '/:domainId/verify',
  authenticate,
  requireRole('OWNER', 'ADMIN'),
  domainController.verify
);

export default router;