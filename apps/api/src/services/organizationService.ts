import { organizationRepository } from '../repositories/organizationRepository';

export const organizationService = {
  create(name: string, userId: string) {
    return organizationRepository.createWithOwner(name, userId);
  },
  listMembers(organizationId: string) {
    return organizationRepository.listMembers(organizationId);
  },
};