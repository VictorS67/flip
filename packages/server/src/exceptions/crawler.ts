export class DataFetchError extends Error {
    constructor(message: string = "An error occurred while fetching data") {
        super(message);
        this.name = "DataFetchError";

        Object.setPrototypeOf(this, DataFetchError.prototype);
    }
}

export class IPBlockError extends Error {
    constructor(message: string = "The server blocked our IP due to frequent requests") {
        super(message);
        this.name = "IPBlockError";

        Object.setPrototypeOf(this, IPBlockError.prototype);
    }
}