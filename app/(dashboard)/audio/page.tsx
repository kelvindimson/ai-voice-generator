// app/audio/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Plus, Play, Download, Trash2, Eye } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface AudioFile {
  id: string;
  name: string;
  voice: string;
  fileSize: number | null;
  duration: string | null;
  createdAt: string;
  fileUrl: string;
  categoryId: string | null;
}

export default function AudioFilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // Fetch audio files
  useEffect(() => {
    if (!session) return;
    
    const fetchAudioFiles = async () => {
      try {
        const response = await fetch("/api/v1/audio");
        if (!response.ok) throw new Error("Failed to fetch audio files");
        const data = await response.json();
        setAudioFiles(data.data || []);
      } catch (error) {
        toast.error("Failed to load audio files");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this audio file?")) return;

    try {
      const response = await fetch(`/api/v1/audio/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Audio file deleted successfully");
      setAudioFiles(audioFiles.filter(file => file.id !== id));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete audio file");
    }
  };

  const handleDownload = (fileUrl: string, name: string) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `${name}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const columns: ColumnDef<AudioFile>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "voice",
      header: "Voice",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("voice")}</span>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const duration = row.getValue("duration") as string | null;
        if (!duration) return "-";
        const seconds = parseFloat(duration);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
      },
    },
    {
      accessorKey: "fileSize",
      header: "Size",
      cell: ({ row }) => {
        const size = row.getValue("fileSize") as number | null;
        if (!size) return "-";
        const mb = (size / (1024 * 1024)).toFixed(2);
        return `${mb} MB`;
      },
    },
    {
      accessorKey: "createdAt",
        header: ({ column }) => {
            return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Created
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            );
        },
        cell: ({ row }) => {
        return formatDate(row.getValue("createdAt"));
        },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const file = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/audio/${file.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(file.fileUrl, "_blank")}>
                <Play className="mr-2 h-4 w-4" />
                Play
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(file.fileUrl, file.name)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(file.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: audioFiles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Audio Files</h1>
        <Button onClick={() => router.push("/new-audio")}>
          <Plus className="mr-2 h-4 w-4" />
          Generate New
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No audio files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}