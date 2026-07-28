import { prisma } from '../lib/prisma';

export const domainRepository = {
  create(organizationId: string, hostname: string) {
    return prisma.domain.create({ data: { organizationId, hostname } });
  },
  findByOrgAndId(organizationId: string, domainId: string) {
    return prisma.domain.findFirst({ where: { id: domainId, organizationId } });
  },
  listByOrg(organizationId: string) {
    return prisma.domain.findMany({ where: { organizationId } });
  },
  markVerified(domainId: string) {
    return prisma.domain.update({
      where: { id: domainId },
      data: { verificationStatus: 'VERIFIED' },
    });
  },
};