import { CHAT_ROLE } from "./role.enum";

export class AssistantMessage {
  constructor(public content: string, private readonly role: CHAT_ROLE.ASSISTANT = CHAT_ROLE.ASSISTANT) {}
}
