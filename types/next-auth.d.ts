
import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            roles: string[];
            sector?: string;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        roles: string[];
        sector?: string;
        isActive: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        roles: string[];
        sector?: string;
    }
}
