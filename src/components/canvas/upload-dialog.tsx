'use client'

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { uploadGeometryFiles } from '@/lib/actions';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectHash?: string;
  acceptedTypes: Record<string, string[]>;
  dialogTitle: string;
  dialogDescription: string;
  supportedFormatsText: string;
}

export function UploadDialog({
  open,
  onOpenChange,
  projectHash,
  acceptedTypes,
  dialogTitle,
  dialogDescription,
  supportedFormatsText
}: UploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    setUploadError(null); // Clear any previous errors
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (uploadedFiles.length === 0 || !projectHash) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData with files
      const formData = new FormData();
      uploadedFiles.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });

      // Call server action
      const result = await uploadGeometryFiles(projectHash, formData);

      if (result.success) {
        console.log('Upload successful:', result.message);
        onOpenChange(false);
        setUploadedFiles([]);
        // Optionally refresh the file tree to show new files
        // You could call a refresh function here
      } else {
        setUploadError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Clear state when dialog closes
      setUploadedFiles([]);
      setUploadError(null);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : isDragReject
                ? 'border-destructive bg-destructive/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} disabled={isUploading} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm text-primary font-medium">Drop the files here...</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isUploading ? 'Uploading files...' : 'Drag & drop files here, or click to select'}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Supports: {supportedFormatsText} (max 50MB each)
            </p>
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Files:</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{uploadError}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={uploadedFiles.length === 0 || isUploading || !projectHash}
          >
            {isUploading ? 'Uploading...' : `Import ${uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}