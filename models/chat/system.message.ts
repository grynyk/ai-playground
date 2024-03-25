import { ChatCompletionSystemMessageParam } from "openai/resources";
import { CHAT_ROLE } from "./role.enum";

export class SystemMessage implements ChatCompletionSystemMessageParam {
  constructor(public content: string, readonly role: CHAT_ROLE.SYSTEM = CHAT_ROLE.SYSTEM) {}
}
