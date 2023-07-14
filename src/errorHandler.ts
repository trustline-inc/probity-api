import { Request, Response, NextFunction } from "express";

export default function (error:  any, request: Request, response: Response, next: NextFunction) {
  response.status(error.status || 500).send(error);
}