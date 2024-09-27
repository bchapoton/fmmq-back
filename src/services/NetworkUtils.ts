import { logWarn } from "../logger/Logger";
import { Request } from "express";

/**
 * Parse pager limit header from request return
 * Max limit value 50
 * Default limit value 5
 *
 * @param req
 * @return int limit pager value
 */
export function getPagerFromRequest(req: Request) {
  const pager = req.header("pager");
  if (pager) {
    const pagerSplit = pager.split("-");
    if (pagerSplit.length === 2 && pagerSplit[0] && pagerSplit[1]) {
      try {
        const start = parseInt(pagerSplit[0]);
        const limit = parseInt(pagerSplit[1]);
        if (limit <= 50) {
          return {
            start: start,
            limit: limit,
          };
        }
      } catch (e) {
        // in case of error in parseInt log and let return the default value
        logWarn("can't parse pager value : " + pager);
      }
    }
  }
  return {
    start: 0,
    limit: 5,
  };
}
