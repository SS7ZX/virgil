import { prisma } from '../lib/prisma';

export const organizationRepository = {
  async createWithOwner(name: string, userId: string) {
    // Atomic: organization + membership OWNER dibuat dalam satu transaksi
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({ data: { name } });
      await tx.organizationMember.create({
        data: { organizationId: org.id, userId, role: 'OWNER' },
      });
      return org;
    });
  },
  findMembership(userId: string, organizationId: string) {
    return prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
  },
  listMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: { select: { id: true, email: true } } },
    });
  },
};