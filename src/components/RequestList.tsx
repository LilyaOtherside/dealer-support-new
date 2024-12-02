import { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Edit2, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { RequestDialog } from './RequestDialog';

interface Request {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

interface RequestListProps {
  requests: Request[];
  onUpdateRequest: (id: string, updates: Partial<Request>) => Promise<void>;
  onDeleteRequest?: (id: string) => Promise<void>;
  onCreateRequest?: (request: Omit<Request, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function RequestList({
  requests = [],
  onUpdateRequest,
  onDeleteRequest,
  onCreateRequest
}: RequestListProps) {
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const handleStatusChange = async (requestId: string, newStatus: Request['status']) => {
    await onUpdateRequest(requestId, { status: newStatus });
  };

  const handleDelete = async (requestId: string) => {
    if (onDeleteRequest && window.confirm('Are you sure you want to delete this request?')) {
      await onDeleteRequest(requestId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Requests</h2>
        {onCreateRequest && (
          <Button
            onClick={() => setShowNewRequestDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{request.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {request.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedRequest(request)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {onDeleteRequest && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(request.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(request.id, 'pending')}
                      className={request.status === 'pending' ? 'bg-accent' : ''}
                    >
                      Mark as Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(request.id, 'in-progress')}
                      className={request.status === 'in-progress' ? 'bg-accent' : ''}
                    >
                      Mark as In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(request.id, 'resolved')}
                      className={request.status === 'resolved' ? 'bg-accent' : ''}
                    >
                      Mark as Resolved
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex gap-2 items-center text-sm">
              <Badge className={getStatusColor(request.status)}>
                {request.status}
              </Badge>
              <Badge className={getPriorityColor(request.priority)}>
                {request.priority} priority
              </Badge>
              <span className="text-gray-500 dark:text-gray-400">
                Created {format(new Date(request.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showNewRequestDialog && (
        <RequestDialog
          onClose={() => setShowNewRequestDialog(false)}
          onSubmit={async (data: Omit<Request, 'id' | 'created_at' | 'updated_at'>) => {
            if (onCreateRequest) {
              await onCreateRequest(data);
              setShowNewRequestDialog(false);
            }
          }}
        />
      )}

      {selectedRequest && (
        <RequestDialog
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSubmit={async (data: Omit<Request, 'id' | 'created_at' | 'updated_at'>) => {
            await onUpdateRequest(selectedRequest.id, data);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}