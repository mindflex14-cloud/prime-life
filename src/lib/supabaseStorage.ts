import { supabase, isSupabaseConfigured } from '../supabase';

// Convert base64 to Blob
export function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
  try {
    const parts = base64.split(',');
    const byteString = atob(parts[1] || parts[0]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  } catch (error) {
    console.error("Failed to convert base64 to Blob:", error);
    throw error;
  }
}

// Ensure the storage bucket exists
export async function ensureBucketExists(bucketName: string = 'prime-life-images'): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("[SupabaseStorage] Supabase is not configured.");
    return false;
  }

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.warn("[SupabaseStorage] Failed to list buckets, attempting to create anyway:", listError);
    }

    const exists = buckets?.some(b => b.name === bucketName);
    if (!exists) {
      console.log(`[SupabaseStorage] Creating bucket: ${bucketName}...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.warn("[SupabaseStorage] Error creating bucket (might be due to permission policies):", createError);
      } else {
        console.log(`[SupabaseStorage] Bucket '${bucketName}' created successfully.`);
      }
    }
    return true;
  } catch (err) {
    console.error("[SupabaseStorage] Exception in ensureBucketExists:", err);
    return false;
  }
}

// Upload a Blob/File or Base64 to Supabase Storage and return the public URL
export async function uploadImageToSupabase(
  dataOrUrl: string | Blob | File,
  userId: string,
  fileNamePrefix: string = 'vision'
): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured yet. Please add your credentials in Settings.");
  }

  const bucketName = 'prime-life-images';
  
  // 1. Ensure the bucket exists
  await ensureBucketExists(bucketName);

  // 2. Prepare the payload as Blob/File
  let body: Blob | File;
  let mimeType = 'image/jpeg';

  if (typeof dataOrUrl === 'string') {
    if (dataOrUrl.startsWith('data:')) {
      const match = dataOrUrl.match(/data:([^;]+);/);
      if (match) {
        mimeType = match[1];
      }
      body = base64ToBlob(dataOrUrl, mimeType);
    } else {
      // It's a raw string URL, no need to upload
      return dataOrUrl;
    }
  } else {
    body = dataOrUrl;
    mimeType = dataOrUrl.type || 'image/jpeg';
  }

  // 3. Generate a unique name
  const extension = mimeType.split('/')[1] || 'jpg';
  const cleanExtension = extension === 'jpeg' ? 'jpg' : extension;
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  const filePath = `${userId}/${fileNamePrefix}-${uniqueId}.${cleanExtension}`;

  console.log(`[SupabaseStorage] Uploading image to path: ${filePath}...`);

  // 4. Upload file
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, body, {
      cacheControl: '3600',
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    console.error("[SupabaseStorage] Upload error details:", error);
    throw error;
  }

  // 5. Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Failed to generate public URL for uploaded image.");
  }

  console.log("[SupabaseStorage] Upload succeeded. Public URL:", publicUrlData.publicUrl);
  return publicUrlData.publicUrl;
}
