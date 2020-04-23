/**
 * Parse pager limit header from request return
 * Max limit value 50
 * Default limit value 5
 *
 * @param req
 * @return int limit pager value
 */
exports.getPagerFromRequest = (req) => {
    const pager = req.header('pager');
    if(pager) {
        try {
            const limitValue = parseInt(pager);
            if(limitValue <= 50) {
                return limitValue;
            }
        } catch (e) {
            // in case of error in parseInt log and let return the default value
            console.log("can't parse pager value : " + pager);
        }
    }
    return 5;
};