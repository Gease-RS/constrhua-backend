export interface ISplitTokenService {
    splitToken(token: string): { payload: string; signature: string };
    reconstructToken(payload: string, signature: string): string;
    verifyReconstructedToken(payload: string, signature: string): Promise<any>;
    generateAccessToken(payload: any, csrfToken: string): string;
    generateRefreshToken(payload: any): string;
    generateCsrfToken(): string;
    decode(token: string): any;
  }
