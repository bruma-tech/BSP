import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { nextCookies } from "better-auth/next-js";


export const auth = betterAuth({
    database: new Pool({
        connectionString: "postgres://ggndp:helloGgndp@123@localhost:5432/brumavone",
      }),
      emailAndPassword: {
        enabled: true,
      },
      plugins: [nextCookies()]
})