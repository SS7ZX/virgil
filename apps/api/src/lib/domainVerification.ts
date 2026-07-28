import dns from 'node:dns/promises';

const TXT_PREFIX = '_virgil-challenge';

export const domainVerification = {
  /**
   * Metode 1: Cek DNS TXT record di _virgil-challenge.<hostname>
   * User diminta menambahkan TXT record dengan value = verification token.
   */
async checkTxtRecord(hostname: string, expectedToken: string): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(`${TXT_PREFIX}.${hostname}`);
    const flatValues = records.map((chunks) => chunks.join(''));
    console.log('[DEBUG] TXT records found:', flatValues, '| expected:', expectedToken);
    return flatValues.includes(expectedToken);
  } catch (err) {
    console.log('[DEBUG] TXT lookup failed (expected if not set up):', (err as Error).message);
    return false;
  }
},

async checkFileVerification(hostname: string, expectedToken: string): Promise<boolean> {
  try {
    const url = `https://${hostname}/.well-known/virgil-verify.txt`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    console.log('[DEBUG] File check status:', res.status, 'for', url);
    if (!res.ok) return false;
    const body = (await res.text()).trim();
    console.log('[DEBUG] File body:', JSON.stringify(body), '| expected:', expectedToken);
    return body === expectedToken;
  } catch (err) {
    console.log('[DEBUG] File check failed:', (err as Error).message);
    return false;
  }
},

  async verify(hostname: string, expectedToken: string): Promise<boolean> {
    // Coba TXT dulu, kalau gagal baru coba file — biar user punya 2 opsi
    const viaTxt = await this.checkTxtRecord(hostname, expectedToken);
    if (viaTxt) return true;
    return this.checkFileVerification(hostname, expectedToken);
  },
};