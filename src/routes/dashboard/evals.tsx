import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/evals")({
  beforeLoad: () => {
    throw redirect({ to: "/app/evals" });
  },
});
