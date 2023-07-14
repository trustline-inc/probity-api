import { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../db/client";
import config from "../config";

/**
 * @function register
 * @param request
 * @param response
 */
 export async function register(request: Request, response: Response): Promise<void> {
  try {
    const { legal_name, email, password } = request.body
    const passwordHash = await bcrypt.hash(password, 12)

    // Create ledger account
    let result = await axios("https://app.moderntreasury.com/api/ledger_accounts", {
      auth: {
        username: "",
        password: ""
      },
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: {
        name: legal_name,
        description: `Ledger account for ${legal_name}`,
        currency: "USD",
        normal_balance: "credit",
        ledger_id: config.modernTreasury.ledgerId
      }
    })
    const ledgerAccountId = result.data.id

    // Create virtual account
    result = await axios("https://app.moderntreasury.com/api/virtual_accounts", {
      auth: {
        username: "",
        password: ""
      },
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: {
        name: legal_name,
        internal_account_id: config.modernTreasury.cashInternalAccountId,
        credit_ledger_account_id: ledgerAccountId,
        debit_ledger_account_id: config.modernTreasury.clientMoneyLedgerAccountId,
        description: `Virtual account for ${legal_name}`
      }
    })
    const virtualAccountId = result.data.id
    await db("users").insert({
      legal_name,
      email,
      password: passwordHash,
      ledger_id: config.modernTreasury.ledgerId,
      ledger_account_id: ledgerAccountId,
      virtual_account_id: virtualAccountId,
    })
    const user = await db("users").where({ email }).first()
    const payload = { email: user.email }
    const secret = "secret"
    const token = await jwt.sign(payload, secret)
    response.json({ token, user })
  } catch (error) {
    console.log(error)
    response.status(500).send("Internal server error")
  }
}

/**
 * @function login
 * @param request
 * @param response
 */
 export async function login(request: Request, response: Response): Promise<void> {
  try {
    const { email, password } = request.body
    const user = await db("users").where({ email }).first()
    if (!user) throw new Error("User not found.")
    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error("Wrong password.")
    const payload = { email: user.email }
    const secret = "secret"
    const token = await jwt.sign(payload, secret)
    response.json({ token, user })
  } catch (error) {
    console.log(error)
    response.status(500).send("Internal server error")
  }
}

/**
 * @function getUser
 * @param request
 * @param response
 */
 export async function getUser(request: Request, response: Response): Promise<void> {
  try {
    const { id } = request.params
    const user = await db("users").where({ id }).first()
    response.json(user)
  } catch (error) {
    response.status(500).send("Internal server error")
  }
}

/**
 * @function updateUser
 * @param request
 * @param response
 */
 export async function updateUser(request: Request, response: Response): Promise<any> {
  try {
    const { id } = request.params
    const user = await db("users").where({ id }).first().update({ ...request.body }).returning("*")
    response.json(user)
  } catch (error) {
    console.log(error)
    response.status(500).send("Internal server error")
  }
}