import { CHAT_ROLE } from "./role.enum";

export class HumanMessage {
  constructor(public content: string, private readonly role: CHAT_ROLE.USER = CHAT_ROLE.USER) {}
}
