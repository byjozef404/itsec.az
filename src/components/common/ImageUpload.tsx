/**
 * ImageUpload — Reusable image uploader for ITSecurity.az
 * - Click-to-browse OR drag-and-drop
 * - Auto-compresses images > 1 MB to WebP at ≤1080p, quality 0.8
 * - Shows live progress, success/error toasts
 * - Uploads to Supabase Storage, returns public URL via onUploaded()
 */
import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, CheckCircle, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MAX_BYTES = 1 * 1024 * 1024; // 1 MB
const MAX_DIM = 1080;
const QUALITY = 0.8;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

async function compressToWebP(file: File): Promise<{ blob: Blob; wasCompressed: boolean; finalSize: number }> {
  return new Promise((resolve, reject) => {
    if (file.size <= MAX_BYTES && file.type === 'image/webp') {
      resolve({ blob: file, wasCompressed: false, finalSize: file.size });
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);

      // Try quality 0.8, degrade if still > 1MB
      const tryEncode = (q: number) => {
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          if (blob.size > MAX_BYTES && q > 0.3) {
            tryEncode(Math.max(q - 0.1, 0.3));
          } else {
            resolve({ blob, wasCompressed: true, finalSize: blob.size });
          }
        }, 'image/webp', q);
      };
      tryEncode(QUALITY);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

function sanitizeFileName(name: string): string {
  const ext = 'webp';
  const base = name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return `${base}_${Date.now()}.${ext}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ImageUploadProps {
  bucket: 'products' | 'banners' | 'avatars' | 'blog';
  path?: string;
  currentUrl?: string;
  onUploaded: (publicUrl: string) => void;
  className?: string;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  bucket,
  path = '',
  currentUrl,
  onUploaded,
  className,
  label = 'Image',
  aspectRatio = 'square',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Unsupported format. Use JPEG, PNG, GIF, WebP or AVIF.');
      return;
    }

    setUploading(true);
    setDone(false);
    setProgress(10);

    try {
      // Local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      setProgress(25);

      // Compress if needed
      const { blob, wasCompressed, finalSize } = await compressToWebP(file);
      setProgress(50);

      const fileName = sanitizeFileName(file.name);
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, { contentType: 'image/webp', upsert: true });

      setProgress(85);

      if (error) throw error;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      setProgress(100);
      setDone(true);

      onUploaded(urlData.publicUrl);

      if (wasCompressed) {
        toast.success(`Uploaded & compressed to ${formatBytes(finalSize)}`);
      } else {
        toast.success('Image uploaded successfully!');
      }

      // Revoke old object URL
      URL.revokeObjectURL(objectUrl);
      setPreview(urlData.publicUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(`Upload failed: ${msg}`);
      setPreview(currentUrl ?? null);
      setDone(false);
    } finally {
      setUploading(false);
      setTimeout(() => { setProgress(0); setDone(false); }, 2500);
    }
  }, [bucket, path, currentUrl, onUploaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  }[aspectRatio];

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-xs font-medium text-muted-foreground block">{label}</label>

      {/* Drop zone / preview area */}
      <div
        className={cn(
          'relative w-full rounded border-2 border-dashed transition-colors cursor-pointer overflow-hidden',
          aspectClass,
          dragging ? 'border-primary bg-primary/10' : 'border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/50',
          done && 'border-solid border-green-500/60',
          uploading && 'pointer-events-none'
        )}
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            {!uploading && (
              <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Upload size={20} className="text-primary" />
                <span className="text-xs text-foreground font-medium">Click to change</span>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
            <ImageIcon size={28} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center">
              Click or drag & drop to upload
            </p>
            <p className="text-xs text-muted-foreground/70 text-center">
              JPEG, PNG, WebP · auto-compressed to WebP
            </p>
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-background/75 flex flex-col items-center justify-center gap-3 p-4">
            <Loader2 size={24} className="text-primary animate-spin" />
            <span className="text-xs text-foreground">Uploading…</span>
            <div className="w-full max-w-[120px]">
              <Progress value={progress} className="h-1" />
            </div>
          </div>
        )}

        {/* Done overlay (brief) */}
        {done && !uploading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <CheckCircle size={28} className="text-green-400" />
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="border border-border text-xs h-7 px-3"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><Loader2 size={11} className="mr-1 animate-spin" />Uploading…</>
          ) : (
            <><Upload size={11} className="mr-1" />Choose File</>
          )}
        </Button>

        {preview && !uploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-border text-xs h-7 px-2 text-destructive hover:text-destructive"
            onClick={e => { e.stopPropagation(); setPreview(null); onUploaded(''); }}
          >
            <X size={11} className="mr-1" />Remove
          </Button>
        )}

        {progress > 0 && progress < 100 && (
          <span className="text-xs text-muted-foreground">{progress}%</span>
        )}
      </div>

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default ImageUpload;
