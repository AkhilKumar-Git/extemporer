// 'use client';

// import React, { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Video, Mic, Square, Play, Pause, UploadCloud, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
// import { storage } from '@/lib/firebase/client'; // Import Firebase storage instance
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { useRouter } from 'next/navigation'; // Import useRouter

// // Helper function to convert Blob to Data URL
// const blobToDataURL = (blob: Blob): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       if (reader.result) {
//         resolve(reader.result as string);
//       } else {
//         reject(new Error("Failed to convert blob to data URL."));
//       }
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// };

// export default function NewExtemporePage() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [isClient, setIsClient] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
//   const [selectedMimeType, setSelectedMimeType] = useState<string>('');
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState<number>(0);
//   const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
//   const router = useRouter(); // Initialize useRouter

//   // Create a ref to store recording chunks
//   const chunksRef = useRef<Blob[]>([]);

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const previewVideoRef = useRef<HTMLVideoElement>(null); // Ref for the playback video

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     if (isClient && videoRef.current) {
//       console.log('[NewExtemporePage] Initial videoRef state - src:', videoRef.current.src, 'srcObject:', videoRef.current.srcObject);
//     }
//   }, [isClient]);

//   // Effect for managing Object URL for the preview
//   useEffect(() => {
//     // This effect only cares about the previewUrl lifecycle for cleanup.
//     if (!previewUrl) {
//       // If there's no current previewUrl, there's nothing to revoke.
//       return;
//     }

//     // Return a cleanup function that revokes the URL when previewUrl changes or component unmounts.
//     return () => {
//       console.log('[NewExtemporePage] useEffect (previewUrl): Revoking preview URL:', previewUrl);
//       URL.revokeObjectURL(previewUrl);
//     };
//   }, [previewUrl]); // Only re-run if previewUrl changes

//   // Effect for cleaning up recorder and stream ONLY on component unmount
//   useEffect(() => {
//     // Capture the current refs at the time the effect is set up.
//     // These values will be used in the cleanup function.
//     const currentRecorder = mediaRecorderRef.current;
//     const currentStream = stream; // Capture stream from state

//     return () => { // This cleanup runs ONLY on component unmount
//       console.log('[NewExtemporePage] Component UNMOUNT cleanup executing...');
//       if (currentRecorder && currentRecorder.state === 'recording') {
//         console.log('[NewExtemporePage] Unmount Cleanup: Stopping MediaRecorder.');
//         currentRecorder.stop(); // This will trigger its onstop if still recording
//       }
//       if (currentStream && currentStream.active) {
//         console.log('[NewExtemporePage] Unmount Cleanup: Stopping stream tracks.');
//         currentStream.getTracks().forEach(track => track.stop());
//       }
//       // Note: previewUrl cleanup is handled by its own dedicated useEffect
//     };
//   }, [stream]); // Re-run if stream instance changes, so cleanup handles the *correct* stream.

//   const handleStartRecording = async () => {
//     if (!isClient || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       setError("Media devices API not available in this browser.");
//       return;
//     }
//     setError(null);
//     setUploadSuccess(null);
//     setRecordedBlob(null);
//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//       setPreviewUrl(null);
//     }
//     // Reset upload progress if starting a new recording
//     setUploadProgress(0);

//     try {
//       console.log('[NewExtemporePage] Requesting media devices...');
//       const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       console.log('[NewExtemporePage] Media stream obtained:', mediaStream);
//       if (mediaStream.getVideoTracks().length > 0) {
//         console.log('[NewExtemporePage] Video tracks found:', mediaStream.getVideoTracks());
//       } else {
//         console.warn('[NewExtemporePage] NO VIDEO TRACKS FOUND IN STREAM.');
//         setError("No video input detected. Please check your camera.");
//         mediaStream.getTracks().forEach(track => track.stop()); // Ensure all tracks are stopped
//         setStream(null);
//         setIsRecording(false);
//         return;
//       }
//       if (mediaStream.getAudioTracks().length > 0) {
//         console.log('[NewExtemporePage] Audio tracks found:', mediaStream.getAudioTracks());
//       } else {
//         console.warn('[NewExtemporePage] NO AUDIO TRACKS FOUND IN STREAM.');
//         setError("No audio input detected. Please check your microphone.");
//         mediaStream.getTracks().forEach(track => track.stop()); // Ensure all tracks are stopped
//         setStream(null);
//         setIsRecording(false);
//         return;
//       }
//       setStream(mediaStream);

//       if (videoRef.current) {
//         console.log('[NewExtemporePage] videoRef.current BEFORE srcObject assignment - src:', videoRef.current.src, 'srcObject:', videoRef.current.srcObject);
//         videoRef.current.src = ''; // Explicitly clear src attribute
//         videoRef.current.srcObject = mediaStream;
//         console.log('[NewExtemporePage] videoRef.current AFTER srcObject assignment - src:', videoRef.current.src, 'srcObject:', videoRef.current.srcObject);
//         videoRef.current.onloadedmetadata = () => {
//           console.log('[NewExtemporePage] onloadedmetadata fired for live preview video element.');
//         };
//         videoRef.current.onerror = (e) => {
//           console.error('[NewExtemporePage] Video element error:', e);
//           setError('An error occurred with the video preview element.');
//         };
//       } else {
//         console.warn('[NewExtemporePage] videoRef.current is NOT available when trying to set srcObject.');
//       }

//       const mimeOptions = [
//         'video/webm;codecs=vp9,opus',
//         'video/webm;codecs=vp8,opus',
//         'video/webm;codecs=h264,opus',
//         'video/webm',
//         'video/mp4;codecs=avc1,mp4a'
//       ];

//       console.log('[NewExtemporePage] Browser MIME type support:');
//       mimeOptions.forEach(type => {
//         console.log(`  ${type}: ${MediaRecorder.isTypeSupported(type)}`);
//       });

//       let determinedMimeType = '';
//       for (const mimeType of mimeOptions) {
//         if (MediaRecorder.isTypeSupported(mimeType)) {
//           determinedMimeType = mimeType;
//           break;
//         }
//       }
//       if (!determinedMimeType) determinedMimeType = 'video/webm'; // Fallback

//       const recorder = new MediaRecorder(mediaStream, { mimeType: determinedMimeType });
//       mediaRecorderRef.current = recorder;
//       chunksRef.current = [];

//       recorder.ondataavailable = (event) => {
//         console.log(`[NewExtemporePage] ondataavailable: size=${event.data.size}, type=${event.data.type}, state=${mediaRecorderRef.current?.state}`);
//         if (event.data && event.data.size > 0) {
//           chunksRef.current.push(event.data);
//           console.log(`[NewExtemporePage] Chunk pushed. Total chunks: ${chunksRef.current.length}`);
//         } else {
//           console.warn('[NewExtemporePage] ondataavailable: Received blob with size 0 or no data. Not adding to chunks.');
//         }
//       };

//       recorder.onstop = () => {
//         console.log(`[NewExtemporePage] onstop: state=${mediaRecorderRef.current?.state}, chunks collected: ${chunksRef.current.length}`);

//         if (chunksRef.current.length === 0) {
//           console.error('[NewExtemporePage] No chunks collected during recording. This means ondataavailable did not yield any data with size > 0.');
//           setError('No data was captured during recording. Please check console for details and ensure your camera/mic are working correctly and not obscured/muted.');
//           // Stop stream tracks here as well, as recording failed
//           if (stream && stream.active) {
//             console.log('[NewExtemporePage] Stopping stream tracks in onstop after failed recording.');
//             stream.getTracks().forEach(track => track.stop());
//           }
//           return;
//         }

//         // Use the actual MIME type the recorder used.
//         const actualMimeType = mediaRecorderRef.current?.mimeType || determinedMimeType;
//         console.log('[NewExtemporePage] Creating blob with MIME type:', actualMimeType);
//         const blob = new Blob(chunksRef.current, { type: actualMimeType });
//         console.log('[NewExtemporePage] recorder.onstop - final recordedBlob size:', blob.size, 'type:', blob.type);

//         if (blob.size === 0) {
//           console.error('[NewExtemporePage] Created blob has zero size, though chunks were reported.');
//           setError('Recording failed to capture any data (blob size is 0). Please try again.');
//           // Stop stream tracks here
//           if (stream && stream.active) {
//             console.log('[NewExtemporePage] Stopping stream tracks in onstop after zero-size blob.');
//             stream.getTracks().forEach(track => track.stop());
//           }
//           return;
//         }

//         // Revoke previous URL if it exists (safety net, also handled by previewUrl effect)
//         if (previewUrl) {
//             console.log("[NewExtemporePage] onstop: Revoking old preview URL prior to setting new one.");
//             URL.revokeObjectURL(previewUrl);
//         }
//         const newPreviewUrl = URL.createObjectURL(blob);
//         console.log('[NewExtemporePage] recorder.onstop - created blob URL:', newPreviewUrl);

//         setRecordedBlob(blob);
//         setPreviewUrl(newPreviewUrl);

//         // Stream tracks are now stopped within the 'onstop' handler after successful recording or error in onstop.
//       };

//       // Log stream and track states before starting
//       console.log('[NewExtemporePage] Before recorder.start() - Stream active:', mediaStream.active);
//       mediaStream.getTracks().forEach(track => {
//         console.log(`[NewExtemporePage] Track: kind=${track.kind}, label="${track.label}", enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`);
//       });

//       recorder.start();
//       console.log('[NewExtemporePage] MediaRecorder started. State:', recorder.state);
//       setIsRecording(true);

//     } catch (err) {
//       console.error("Error accessing media devices.", err);
//       if (err instanceof Error) {
//         if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
//           setError("No camera or microphone found. Please ensure they are connected and enabled.");
//         } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
//           setError("Permission denied. Please allow access to your camera and microphone in browser settings.");
//         } else {
//           setError(`An error occurred: ${err.message}`);
//         }
//       } else {
//         setError("An unknown error occurred while accessing media devices.");
//       }
//       setIsRecording(false);
//       setStream(null); // Clean up the stream on error
//     }
//   };

//   const handleStopRecording = () => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
//       console.log('[NewExtemporePage] Calling MediaRecorder.stop(). Current state:', mediaRecorderRef.current.state);
//       mediaRecorderRef.current.stop(); // This will eventually trigger 'onstop'
//       // Stream tracks are now stopped within the 'onstop' handler.
//     } else {
//       console.warn('[NewExtemporePage] handleStopRecording called but recorder not active or not in recording state. Current state:', mediaRecorderRef.current?.state);
//       // If somehow tracks are still active and recorder isn't, clean them up as a fallback.
//       if (stream && stream.active) {
//         console.log("[NewExtemporePage] handleStopRecording: Fallback - stopping active stream tracks.");
//         stream.getTracks().forEach(track => track.stop());
//       }
//     }
//     setIsRecording(false);
//     setUploadSuccess(null); // Clear success message if starting a new recording flow
//     setUploadProgress(0);
//   };

//   const handleUpload = async () => {
//     if (!recordedBlob) {
//       setError("No recording available to upload.");
//       return;
//     }
//     setError(null);
//     setUploadSuccess(null);
//     setIsUploading(true);
//     setUploadProgress(0);

//     const fileExtension = recordedBlob.type.split('/')[1]?.split(';')[0] || 'webm';
//     const uniqueFileName = `extempore_${Date.now()}.${fileExtension}`;
//     const storagePath = `recordings/${uniqueFileName}`;
//     const storageRef = ref(storage, storagePath);

//     console.log(`[NewExtemporePage] Starting upload to: ${storagePath} with type: ${recordedBlob.type}`);

//     const uploadTask = uploadBytesResumable(storageRef, recordedBlob, { contentType: recordedBlob.type });

//     uploadTask.on('state_changed',
//       (snapshot) => {
//         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//         setUploadProgress(progress);
//         console.log('Upload is ' + progress + '% done');
//       },
//       (uploadError) => {
//         console.error("[NewExtemporePage] Firebase upload error:", uploadError);
//         // More specific error messages based on uploadError.code can be added here
//         // e.g., storage/unauthorized, storage/canceled, storage/unknown
//         let message = "Upload failed. Please try again.";
//         if (uploadError.code === 'storage/unauthorized') {
//             message = "Upload failed: Permission denied. Please ensure you are logged in and have upload rights.";
//         } else if (uploadError.code === 'storage/canceled') {
//             message = "Upload canceled.";
//         }
//         setError(message);
//         setIsUploading(false);
//         setUploadProgress(0);
//       },
//       async () => {
//         console.log("[NewExtemporePage] File uploaded successfully to Firebase Storage.");
//         try {
//           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//           console.log("[NewExtemporePage] Got download URL:", downloadURL);

//           const metadataPayload = {
//             storagePath: storagePath,
//             downloadURL: downloadURL,
//             fileName: uniqueFileName,
//             contentType: recordedBlob.type,
//             size: recordedBlob.size,
//             // userId: auth.currentUser?.uid, // TODO: Add when auth is integrated
//             createdAt: new Date().toISOString(),
//           };

//           // Now, send metadata to our backend API to store in Firestore
//           const metadataResponse = await fetch('/api/save-recording-metadata', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(metadataPayload),
//           });

//           const metadataResult = await metadataResponse.json();

//           if (!metadataResponse.ok || !metadataResult.success) {
//             throw new Error(metadataResult.error || "Failed to save recording metadata.");
//           }

//           setUploadSuccess(`Successfully uploaded: ${uniqueFileName} and saved metadata! ID: ${metadataResult.id}`);
//           console.log("[NewExtemporePage] Metadata saved successfully:", metadataResult);
          
//           // Clear local recording state after successful upload and metadata save
//           setRecordedBlob(null);
//           if (previewUrl) {
//             URL.revokeObjectURL(previewUrl);
//             setPreviewUrl(null);
//           }
//           chunksRef.current = [];

//           // Redirect to the analysis page
//           if (metadataResult.id) {
//             router.push(`/analysis/${metadataResult.id}`);
//           } else {
//             console.error("[NewExtemporePage] No ID returned from metadata save, cannot redirect.");
//             // Optionally set an error message for the user
//           }

//         } catch (errorAfterUpload) {
//           console.error("[NewExtemporePage] Error after upload (getting URL or saving metadata):", errorAfterUpload);
//           if (errorAfterUpload instanceof Error) {
//             setError(`Post-upload operation failed: ${errorAfterUpload.message}`);
//           } else {
//             setError("An unknown error occurred after uploading the file while finalizing.");
//           }
//         }
//         setIsUploading(false);
//         setUploadProgress(100); // Ensure progress shows 100% on completion
//       }
//     );
//   };

//   return (
//     <div className="container mx-auto py-8 flex flex-col items-center">
//       <h1 className="text-3xl font-bold mb-6">Record New Extempore</h1>

//       {error && (
//         <div className="w-full max-w-2xl bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4" role="alert">
//           <div className="flex">
//             <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
//             <div>
//               <p className="font-bold">Error</p>
//               <p className="text-sm">{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="w-full max-w-2xl bg-muted/40 p-6 rounded-lg shadow-lg mb-6">
//         {isClient ? (
//           <video
//             ref={videoRef}
//             className="w-full h-auto rounded aspect-video bg-black"
//             autoPlay
//             playsInline
//             muted
//             onLoadedMetadata={() => console.log('[NewExtemporePage] Video element onLoadedMetadata event fired')}
//             onError={(e) => console.error('[NewExtemporePage] Video element error:', e)}
//           />
//         ) : (
//           <div className="w-full aspect-video bg-black flex items-center justify-center text-white rounded">
//             Loading camera...
//           </div>
//         )}
//       </div>

//       <div className="flex gap-4 mb-6">
//         {!isRecording ? (
//           <Button onClick={handleStartRecording} size="lg" className="bg-green-500 hover:bg-green-600" disabled={!isClient || isRecording || isUploading}>
//             <Mic className="mr-2 h-5 w-5" /> Start Recording
//           </Button>
//         ) : (
//           <Button onClick={handleStopRecording} size="lg" variant="destructive" disabled={!isClient || !isRecording || isUploading}>
//             <Square className="mr-2 h-5 w-5" /> Stop Recording
//           </Button>
//         )}
//       </div>

//       {isUploading && (
//         <div className="w-full max-w-md p-4 my-4">
//           <div className="text-center mb-2">Uploading... {uploadProgress.toFixed(2)}%</div>
//           <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
//             <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
//           </div>
//         </div>
//       )}

//       {!isRecording && recordedBlob && !uploadSuccess && (
//         <div className="w-full max-w-2xl flex flex-col items-center gap-4 p-4 border border-dashed rounded-lg">
//           <h2 className="text-xl font-semibold">Preview Recording</h2>
//           <video
//             ref={previewVideoRef} // Use the new ref for the preview video
//             src={previewUrl || ''} // Use the state variable for blob URL
//             controls
//             className="w-full rounded aspect-video bg-black"
//             onLoadedMetadata={() => console.log('[NewExtemporePage] Preview video loaded metadata')}
//             onError={(e) => {
//               console.error('[NewExtemporePage] Preview video error:', e);
//               setError('Error playing back the recording. The format may not be supported by your browser.');
//             }}
//           />
//           <div className="text-sm text-gray-500">
//             Recording size: {(recordedBlob.size / 1024).toFixed(2)} KB | Type: {recordedBlob.type}
//           </div>
//           <Button onClick={handleUpload} size="lg" className="bg-blue-500 hover:bg-blue-600" disabled={isUploading || !recordedBlob}>
//             {isUploading ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                 Processing...
//               </>
//             ) : (
//               <>
//                 <UploadCloud className="mr-2 h-5 w-5" /> Upload to Cloud
//               </>
//             )}
//           </Button>
//         </div>
//       )}

//       {uploadSuccess && (
//         <div className="w-full max-w-2xl bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-4" role="alert">
//           <p className="font-bold">Success!</p>
//           <p className="text-sm">{uploadSuccess}</p>
//         </div>
//       )}
//     </div>
//   );
// }