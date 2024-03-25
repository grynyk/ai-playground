import { CHAT_ROLE } from "./role.enum";

export class SystemMessage {
  constructor(public content: string, private readonly role: CHAT_ROLE.SYSTEM = CHAT_ROLE.SYSTEM) {}
}
