import { Request, Response } from "express";

/**
 * @function checkHealth
 * @param request
 * @param response
 */
export async function checkHealth(request: Request, response: Response): Promise<any> {
  return response.status(200).send('OK').end();
}
