import { ChatCompletionUserMessageParam } from "openai/resources";
import { CHAT_ROLE } from "./role.enum";

export class HumanMessage implements ChatCompletionUserMessageParam {
  constructor(public content: string, readonly role: CHAT_ROLE.USER = CHAT_ROLE.USER) {}
}
