import axios from "axios";
import { Request, Response } from "express";
import ModernTreasury from "modern-treasury";
import { Configuration, PlaidApi, PlaidEnvironments, Products, ProcessorTokenCreateRequest } from 'plaid';
import config from "../config"
import db from "../db/client";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': "",
      'PLAID-SECRET': "",
    },
  },
});

const plaid = new PlaidApi(configuration);

const modernTreasury = new ModernTreasury({
  apiKey: config.modernTreasury.apiKey,
  organizationId: ""
});

/**
 * @function getAccount
 * @param request
 * @param response
 */
 export async function getAccount(request: Request, response: Response): Promise<any> {
    try {
        const ledgerAccount = await modernTreasury.ledgerAccounts.retrieve(request.params.account_id);
        response.json(ledgerAccount)
    } catch (error) {
        console.log(error)
        response.status(500).send("Internal server error")
    }
}

/**
 * @function listTransactions
 * @param request
 * @param response
 */
 export async function listTransactions(request: Request, response: Response): Promise<any> {
    try {
        const query: ModernTreasury.LedgerTransactionListParams = {
            ledger_account_id: request.params.account_id
        }
        const transactions = await modernTreasury.ledgerTransactions.list(query);
        response.json(transactions)
    } catch (error) {
        console.log(error)
        response.status(500).send("Internal server error")
    }
}

/**
 * @function listExternalAccounts
 * @param request
 * @param response
 */
export async function listExternalAccounts(request: Request, response: Response): Promise<any> {
    try {
        const { account_id } = request.params
        const { counterparty_id } = await db("users").where({ ledger_account_id: account_id }).first()
        const query: ModernTreasury.ExternalAccountListParams = { counterparty_id }
        const externalAccounts = await modernTreasury.externalAccounts.list(query)
        response.json(externalAccounts)
    } catch (error) {
        console.log(error)
        response.status(500).send("Internal server error")
    }
}

/**
 * @function getPlaidLinkToken
 * @param request
 * @param response
 */
 export async function getPlaidLinkToken(request: Request, response: Response): Promise<any> {
    try {
        const result = await plaid.linkTokenCreate({
            user: {
                client_user_id: request.params.account_id,
            },
            products: [Products.Auth],
            client_name: "Probity",
            // @ts-ignore
            country_codes: ["US"],
            language: "en"
        })
        response.json(result.data)
    } catch (error) {
        console.log(error)
        response.status(500).send("Internal server error")
    }
}

/**
 * @function createPlaidAccessToken
 * @param request
 * @param response
 */
 export async function createPlaidAccessToken(request: Request, response: Response): Promise<any> {
    try {
        const { account_id } = request.params
        const { publicToken } = request.body
        const result = await plaid.itemPublicTokenExchange({ public_token: publicToken });
        const access_token = result.data.access_token;
        await db("users").where({ ledger_account_id: account_id }).first().update({ plaid_access_token: access_token })
        response.status(201).end()
    } catch (error) {
        console.log(error)
        response.status(500).send("Internal server error")
    }
}

/**
 * @function createExternalAccount
 * @param request
 * @param response
 */
 export async function createExternalAccount(request: Request, response: Response): Promise<any> {
    try {
        const { account_id } = request.params
        const { accountId } = request.body
        const { legal_name, plaid_access_token } = await db("users").where({ ledger_account_id: account_id }).first()

        // @ts-ignore
        const result = await plaid.processorTokenCreate({
            access_token: plaid_access_token,
            account_id: accountId,
            // @ts-ignore
            processor: "modern_treasury"
        });
        const { processor_token } = result.data;
        await db("users").where({ ledger_account_id: account_id }).first().update({ plaid_processor_token: processor_token })

        const body: ModernTreasury.CounterpartyCreateParams = {
            name: legal_name,
            accounts: [
                {
                    plaid_processor_token: processor_token
                }
            ]
        }
        const { id } = await modernTreasury.counterparties.create(body)
        await db("users").where({ ledger_account_id: account_id }).first().update({ counterparty_id: id })
        response.status(201).end()
    } catch (error) {
        console.log(error)
        response.status(500).send("Internal server error")
    }
}

/**
 * @function deleteExternalAccount
 * @param request
 * @param response
 */
 export async function deleteExternalAccount(request: Request, response: Response): Promise<any> {
    try {
        const { externalAccountId } = request.params
        await modernTreasury.externalAccounts.del(externalAccountId)
        response.status(204).end()
    } catch (error) {
        console.log(error)
        response.status(500).send("Internal server error")
    }
}

/**
 * @function createDeposit
 * @param request
 * @param response
 */
 export async function createDeposit(request: Request, response: Response): Promise<any> {
    try {
        const { account_id: clientLedgerAccountId } = request.params
        const { amount, external_account_id: externalAccountId } = request.body
        const body: ModernTreasury.PaymentOrderCreateParams = {
            type: "ach",
            // TODO: add subtype (https://www.moderntreasury.com/learn/sec-codes)
            amount: amount * 100,
            direction: "debit",
            // This is the internal account id
            originating_account_id: config.modernTreasury.cashInternalAccountId!,
            // This is the external account id (user's bank account)
            receiving_account_id: externalAccountId,
            currency: "USD",
            statement_descriptor: "Probity",
            ledger_transaction: {
                description: "Deposit funds into Probity",
                // TODO: Check date, it's in UTC format here.
                effective_date: new Date().toISOString().split('T')[0],
                ledger_entries: [
                    {
                        amount: amount * 100,
                        direction: "credit",
                        ledger_account_id: clientLedgerAccountId
                    },
                    {
                        amount: amount * 100,
                        direction: "debit",
                        ledger_account_id: config.modernTreasury.clientMoneyLedgerAccountId!
                    }
                ]
            }
        }
        const result = await axios({
            url: "https://app.moderntreasury.com/api/payment_orders",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Basic <TOKEN>`,
                "Content-Type": "application/json"
            },
            data: body
        })
        // await modernTreasury.paymentOrders.create(body)
        response.status(201).end()
    } catch (error) {
        console.log(error.response.data)
        response.status(500).send("Internal server error")
    }
}

/**
 * @function createWithdrawal
 * @param request
 * @param response
 */
 export async function createWithdrawal(request: Request, response: Response): Promise<any> {
    try {
        const { account_id: clientLedgerAccountId } = request.params
        const { amount, external_account_id: externalAccountId } = request.body
        const body: ModernTreasury.PaymentOrderCreateParams = {
            type: "ach",
            // TODO: add subtype (https://www.moderntreasury.com/learn/sec-codes)
            amount: amount * 100,
            direction: "credit",
            // This is the internal account id
            originating_account_id: config.modernTreasury.cashInternalAccountId!,
            // This is the external account id (user's bank account)
            receiving_account_id: externalAccountId,
            currency: "USD",
            statement_descriptor: "Probity",
            ledger_transaction: {
                description: "Withdraw funds from Probity",
                // TODO: Check date, it's in UTC format here.
                effective_date: new Date().toISOString().split('T')[0],
                ledger_entries: [
                    {
                        amount: amount * 100,
                        direction: "debit",
                        ledger_account_id: clientLedgerAccountId
                    },
                    {
                        amount: amount * 100,
                        direction: "credit",
                        ledger_account_id: config.modernTreasury.clientMoneyLedgerAccountId!
                    }
                ]
            }
        }
        const result = await axios({
            url: "https://app.moderntreasury.com/api/payment_orders",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Basic <TOKEN>`,
                "Content-Type": "application/json"
            },
            data: body
        })
        // await modernTreasury.paymentOrders.create(body)
        response.status(201).end()
    } catch (error) {
        console.log(error.response.data)
        response.status(500).send("Internal server error")
    }
}