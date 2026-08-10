import { signOut } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { UploadForm } from "@/components/documents/upload-form";
import { DocumentList } from "@/components/documents/document-list";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const workspace = await getOrCreateDefaultWorkspace(userId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Documents</h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8">
        <UploadForm />
      </div>

      <div className="mt-8">
        <DocumentList workspaceId={workspace.id} />
      </div>
    </main>
  );
}
