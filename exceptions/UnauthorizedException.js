class UnauthorizedException {
    constructor(message = 'Unauthorized') {
        this.message = message;
    }
}

exports.UnauthorizedException = UnauthorizedException;