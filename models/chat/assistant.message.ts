import { ChatCompletionAssistantMessageParam } from "openai/resources";
import { CHAT_ROLE } from "./role.enum";

export class AssistantMessage implements ChatCompletionAssistantMessageParam {
  constructor(public content: string, readonly role: CHAT_ROLE.ASSISTANT = CHAT_ROLE.ASSISTANT) {}
}
