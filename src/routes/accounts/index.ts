import { Router } from "express";
import { accountsController } from "../../controllers";

const router = Router()

router.get("/:account_id", accountsController.getAccount);
router.get("/:account_id/transactions", accountsController.listTransactions);
router.post("/:account_id/deposits", accountsController.createDeposit);
router.post("/:account_id/withdrawals", accountsController.createWithdrawal);
router.get("/:account_id/external_accounts", accountsController.listExternalAccounts);
router.post("/:account_id/external_accounts", accountsController.createExternalAccount);
router.delete("/:account_id/external_accounts/:externalAccountId", accountsController.deleteExternalAccount);
router.get("/:account_id/plaid/link_token", accountsController.getPlaidLinkToken);
router.post("/:account_id/plaid/access_token", accountsController.createPlaidAccessToken);

export default router;