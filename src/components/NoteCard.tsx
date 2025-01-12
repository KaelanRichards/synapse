import { Note } from "@/types";
import { useRouter } from "next/navigation";

interface NoteCardProps {
  note: Note;
  showConnections?: boolean;
}

export default function NoteCard({
  note,
  showConnections = false,
}: NoteCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/notes/${note.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer"
    >
      <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{note.content}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-primary-600 font-medium">
          {note.maturity_state.toLowerCase()}
        </span>
        {showConnections && note.connections && (
          <span className="text-gray-500">
            {note.connections.length} connection
            {note.connections.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {showConnections && note.connections && note.connections.length > 0 && (
        <div className="mt-3 space-y-1">
          {note.connections.slice(0, 3).map((connection) => (
            <div
              key={connection.id}
              className="text-xs text-gray-500 flex items-center space-x-1"
            >
              <span className="w-2 h-2 rounded-full bg-primary-200" />
              <span>{connection.connection_type}</span>
            </div>
          ))}
          {note.connections.length > 3 && (
            <div className="text-xs text-gray-400">
              +{note.connections.length - 3} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}
