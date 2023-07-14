import { Request, Response } from "express";

/**
 * @function modernTreasuryWebhookEndpoint
 * @param request
 * @param response
 * Webhook endpoint for Modern Treasury
 */
 export async function modernTreasuryWebhookEndpoint(request: Request, response: Response): Promise<any> {
    try {
        console.log(request.body)
        response.status(200).end()
    } catch (error) {
        console.log(error)
        response.status(500).send("Internal server error")
    }
}