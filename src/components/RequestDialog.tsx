import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Paperclip, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FileOptions } from '@supabase/storage-js';

interface Request {
  id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
}

// Создаем свой тип для опций загрузки файла
interface UploadOptions {
  onUploadProgress?: (progress: number) => void;
}

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface RequestDialogProps {
  onClose: () => void;
  onSubmit: (data: Omit<Request, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  request?: Request;
}

export function RequestDialog({ onClose, onSubmit, request }: RequestDialogProps) {
  const [title, setTitle] = useState(request?.title || '');
  const [description, setDescription] = useState(request?.description || '');
  const [status, setStatus] = useState<Request['status']>(request?.status || 'pending');
  const [priority, setPriority] = useState<Request['priority']>(request?.priority || 'medium');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
        throw new Error('User not authenticated');
      }

      await onSubmit({
        title,
        description,
        status,
        priority
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      throw error;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const options: UploadOptions = {
        onUploadProgress: (progress: number) => {
          setUploadProgress(progress);
        }
      };

      const { data: uploadData } = await supabase.storage
        .from('files')
        .upload(`${Date.now()}-${file.name}`, file, options as any);

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(uploadData.path);

        setUploadedFiles(prev => [...prev, {
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size,
        }]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const removeAttachment = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{request ? 'Edit Request' : 'New Request'}</DialogTitle>
          <DialogDescription>
            {request 
              ? 'Edit the details of your request below.' 
              : 'Fill in the details of your new request.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value: string) => {
                    setStatus(value as Request['status']);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={priority} 
                  onValueChange={(value: string) => {
                    setPriority(value as Request['priority']);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="w-full"
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Add Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4" />
                          <div>
                            <div className="text-sm font-medium">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttachment(index)}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 