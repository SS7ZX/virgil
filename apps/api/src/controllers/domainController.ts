import { Response, NextFunction } from 'express';
import { domainService } from '../services/domainService';
import { AuthenticatedRequest } from '../middleware/auth';

export const domainController = {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { hostname } = req.body;
      const orgId = req.params.orgId;
      if (!orgId || Array.isArray(orgId)) throw new Error('Invalid organization id');
      const domain = await domainService.register(orgId, hostname);
      res.status(201).json(domain);
    } catch (err) {
      next(err);
    }
  },
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orgId = req.params.orgId;
      if (!orgId || Array.isArray(orgId)) throw new Error('Invalid organization id');
      const domains = await domainService.list(orgId);
      res.status(200).json(domains);
    } catch (err) {
      next(err);
    }
  },
  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orgId = req.params.orgId;
      const domainId = req.params.domainId;
      if (!orgId || Array.isArray(orgId) || !domainId || Array.isArray(domainId)) {
        throw new Error('Invalid parameters');
      }
      const domain = await domainService.verify(orgId, domainId);
      res.status(200).json(domain);
    } catch (err) {
      next(err);
    }
  },
};