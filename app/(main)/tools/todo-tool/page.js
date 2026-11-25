import { TodoTool } from "@/app/(main)/tools-compo/TodoTool";

export const metadata = {
  alternates: { canonical: "https://toolstrek.vercel.app/tools/todo-tool" },
  title: "Todo Tool — Task Manager",
  description:
    "A professional, fully customizable task manager. Organize tasks with priorities, categories, subtasks, due dates, tags, and more. Export/import your data, track progress with live stats, and personalize with accent colors.",
  keywords: [
    "todo",
    "task manager",
    "todo list",
    "productivity",
    "task organizer",
    "to-do app",
    "task tracker",
    "subtasks",
    "priorities",
  ],
};

export default function Page() {
  return <TodoTool />;
}
