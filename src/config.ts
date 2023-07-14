import dotenv from "dotenv"

const mode = process.env.NODE_ENV;

// tslint:disable:no-console
if (mode) console.log(`Loading Node configuration for ${mode}`);
else console.log("NODE_ENV envvar not set. Did you forget?");

// Load the dotenv file by environment
const path = mode ? `.env.${mode}` : '.env';
dotenv.config({ path });

export default {
    app: {
        port: 8080
    },
    postgres: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: 5432
    },
    modernTreasury: {
        apiKey: process.env.MODERN_TREASURY_API_KEY,
        ledgerId: process.env.LEDGER_ID,
        cashInternalAccountId: process.env.CASH_INTERNAL_ACCOUNT_ID,
        clientMoneyLedgerAccountId: process.env.CASH_LEDGER_ACCOUNT_ID
    }
}