import {BaseMessage} from "./BaseMessage";

export function messagesToPromptFormat(messages: BaseMessage[]) {
  return messages.map(msg => msg.toPromptFormat());
}

export function filterMessagesByType(messages: BaseMessage[], type: string) {
  return messages.filter(m => m.type === type);
}

export function getLastMessages(messages: BaseMessage[], n: number) {
  if (n <= 0) {
    return [];
  }
  return messages.slice(-n);
}
