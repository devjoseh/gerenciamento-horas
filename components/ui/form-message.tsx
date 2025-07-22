export type Message =
    | { success: string }
    | { error: string }
    | { message: string }
    | { registered: boolean }
    | null;

import { cn } from "@/lib/utils";

export function FormMessage({ message }: { message: Message }) {
    const getMessages = () => {
        if (!message) {
            return null;
        }
        if ("error" in message) {
            return message.error.split(";").map((msg, index) => ({
                type: "error",
                content: msg,
                key: `error-${index}`,
            }));
        }
        if ("success" in message) {
            return [
                { type: "success", content: message.success, key: "success" },
            ];
        }
        if ("message" in message) {
            return [
                { type: "message", content: message.message, key: "message" },
            ];
        }
        if ("registered" in message && message.registered) {
            return [
                {
                    type: "success",
                    content: `Conta criada com sucesso! Agora você pode fazer login com suas credenciais.`,
                    key: "success",
                },
            ];
        }
    };

    const messages = getMessages();

    return (
        <div className="flex flex-col gap-2 w-full max-w-md text-sm">
            {messages
                ? messages.map(({ type, content, key }) => (
                      <div
                          key={key}
                          className={cn(
                              "border-l-2 px-4 py-3 rounded-r-md flex items-start gap-2",
                              {
                                  "text-green-600 bg-green-50 border-green-600":
                                      type === "success",
                                  "text-red-600 bg-red-50 border-red-600":
                                      type === "error",
                                  "text-blue-600 bg-blue-50 border-blue-600":
                                      type === "message",
                              }
                          )}
                      >
                          {type === "error" && (
                              <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 shrink-0"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                              >
                                  <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"
                                  />
                              </svg>
                          )}
                          {type === "success" && (
                              <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 shrink-0"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                              >
                                  <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                  />
                              </svg>
                          )}
                          <span className="leading-5">{content}</span>
                      </div>
                  ))
                : null}
        </div>
    );
}
