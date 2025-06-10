declare module '*/config' {
  export const environment: string;
  export const config: {
    db: { url: string };
    server: { port: number };
    auth: { jwtSecret: string };
  };
}

declare module '*/logger' {
  export const logger: any;
}
