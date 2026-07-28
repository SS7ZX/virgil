import { Response, NextFunction } from 'express';
import { organizationService } from '../services/organizationService';
import { AuthenticatedRequest } from '../middleware/auth';

export const organizationController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const org = await organizationService.create(name, req.user!.id);
      res.status(201).json(org);
    } catch (err) {
      next(err);
    }
  },
  async listMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orgId = req.params.orgId;
      if (!orgId || Array.isArray(orgId)) {
        throw new Error('Invalid organization id');
      }
      const members = await organizationService.listMembers(orgId);
      res.status(200).json(members);
    } catch (err) {
      next(err);
    }
  },
};