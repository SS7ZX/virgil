import { prisma } from '../lib/prisma';

export const domainService = {
	async register(organizationId: string, hostname: string) {
		if (!organizationId || !hostname) throw new Error('Missing organizationId or hostname');
		return prisma.domain.create({ data: { organizationId, hostname } });
	},

	async list(organizationId: string) {
		if (!organizationId) throw new Error('Missing organizationId');
		return prisma.domain.findMany({ where: { organizationId } });
	},

	async verify(organizationId: string, domainId: string) {
		if (!organizationId || !domainId) throw new Error('Missing organizationId or domainId');
		const domain = await prisma.domain.findUnique({ where: { id: domainId } });
		if (!domain || domain.organizationId !== organizationId) throw new Error('Domain not found for this organization');
		return prisma.domain.update({ where: { id: domainId }, data: { verificationStatus: 'VERIFIED' } });
	},
};
