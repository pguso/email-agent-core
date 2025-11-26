import { ParsedMail } from "mailparser";

export interface MessageParts {
    seqno: number;
    parsed?: ParsedMail;
    parseError?: Error;
    attrs?: any;
}

export interface ImapBox {
    name: string;
    [key: string]: any;
}